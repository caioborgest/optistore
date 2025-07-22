import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import { notificationService } from './notificationService';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface GeofenceRegion {
  id: string;
  latitude: number;
  longitude: number;
  radius: number; // em metros
  title: string;
  description?: string;
}

export interface TaskLocation {
  taskId: string;
  title: string;
  latitude: number;
  longitude: number;
  address?: string;
  radius?: number;
}

class LocationService {
  private watchId: Location.LocationSubscription | null = null;
  private geofences: GeofenceRegion[] = [];
  private taskLocations: TaskLocation[] = [];

  async requestPermissions(): Promise<boolean> {
    try {
      // Solicitar permissão de localização
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        console.log('Permissão de localização em foreground negada');
        return false;
      }

      // Solicitar permissão de localização em background (opcional)
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        console.log('Permissão de localização em background negada');
        // Continua sem background location
      }

      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissões de localização:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000, // 10 segundos
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Erro ao obter localização atual:', error);
      return null;
    }
  }

  async startLocationTracking(): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // 30 segundos
          distanceInterval: 50, // 50 metros
        },
        (location) => {
          this.handleLocationUpdate({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            altitude: location.coords.altitude,
            heading: location.coords.heading,
            speed: location.coords.speed,
            timestamp: location.timestamp,
          });
        }
      );

      return true;
    } catch (error) {
      console.error('Erro ao iniciar rastreamento de localização:', error);
      return false;
    }
  }

  stopLocationTracking(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  private async handleLocationUpdate(location: LocationData): Promise<void> {
    try {
      // Salvar localização localmente
      await AsyncStorage.setItem('lastKnownLocation', JSON.stringify(location));

      // Verificar geofences
      await this.checkGeofences(location);

      // Verificar proximidade com tarefas
      await this.checkTaskProximity(location);

      // Enviar localização para o servidor (se necessário)
      await this.sendLocationToServer(location);
    } catch (error) {
      console.error('Erro ao processar atualização de localização:', error);
    }
  }

  private async checkGeofences(location: LocationData): Promise<void> {
    for (const geofence of this.geofences) {
      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        geofence.latitude,
        geofence.longitude
      );

      if (distance <= geofence.radius) {
        await this.handleGeofenceEnter(geofence, location);
      }
    }
  }

  private async checkTaskProximity(location: LocationData): Promise<void> {
    for (const taskLocation of this.taskLocations) {
      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        taskLocation.latitude,
        taskLocation.longitude
      );

      const radius = taskLocation.radius || 100; // 100 metros padrão

      if (distance <= radius) {
        await notificationService.notifyLocationReminder(
          taskLocation.title,
          taskLocation.taskId,
          taskLocation.address || 'Local da tarefa'
        );

        // Remover da lista para evitar notificações repetidas
        this.taskLocations = this.taskLocations.filter(tl => tl.taskId !== taskLocation.taskId);
      }
    }
  }

  private async handleGeofenceEnter(geofence: GeofenceRegion, location: LocationData): Promise<void> {
    console.log(`Entrou na geofence: ${geofence.title}`);
    
    // Registrar entrada na geofence
    await this.logGeofenceEvent(geofence.id, 'enter', location);

    // Notificar usuário se necessário
    if (geofence.title.includes('Trabalho') || geofence.title.includes('Loja')) {
      await notificationService.scheduleLocalNotification({
        title: '📍 Chegada Registrada',
        body: `Você chegou em ${geofence.title}`,
        data: {
          type: 'geofence_enter',
          geofenceId: geofence.id,
          location,
        },
      });
    }
  }

  private async logGeofenceEvent(geofenceId: string, event: 'enter' | 'exit', location: LocationData): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('location_events')
        .insert({
          user_id: user.id,
          geofence_id: geofenceId,
          event_type: event,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: new Date(location.timestamp).toISOString(),
        });
    } catch (error) {
      console.error('Erro ao registrar evento de geofence:', error);
    }
  }

  private async sendLocationToServer(location: LocationData): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Enviar apenas a cada 5 minutos para economizar dados
      const lastSent = await AsyncStorage.getItem('lastLocationSent');
      const now = Date.now();
      
      if (lastSent && (now - parseInt(lastSent)) < 5 * 60 * 1000) {
        return;
      }

      await supabase
        .from('user_locations')
        .upsert({
          user_id: user.id,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: new Date(location.timestamp).toISOString(),
          updated_at: new Date().toISOString(),
        });

      await AsyncStorage.setItem('lastLocationSent', now.toString());
    } catch (error) {
      console.error('Erro ao enviar localização para servidor:', error);
    }
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distância em metros
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result.length > 0) {
        const address = result[0];
        return `${address.street || ''} ${address.streetNumber || ''}, ${address.district || ''}, ${address.city || ''} - ${address.region || ''}`.trim();
      }

      return null;
    } catch (error) {
      console.error('Erro ao fazer geocodificação reversa:', error);
      return null;
    }
  }

  async geocode(address: string): Promise<LocationData | null> {
    try {
      const result = await Location.geocodeAsync(address);

      if (result.length > 0) {
        const location = result[0];
        return {
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: Date.now(),
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao fazer geocodificação:', error);
      return null;
    }
  }

  // Funcionalidades específicas do OptiFlow
  async registerCheckIn(location?: LocationData): Promise<boolean> {
    try {
      const currentLocation = location || await this.getCurrentLocation();
      if (!currentLocation) return false;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const address = await this.reverseGeocode(currentLocation.latitude, currentLocation.longitude);

      await supabase
        .from('time_records')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          clock_in: new Date().toISOString(),
          location: address || `${currentLocation.latitude}, ${currentLocation.longitude}`,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        });

      await notificationService.scheduleLocalNotification({
        title: '✅ Check-in Registrado',
        body: `Check-in realizado em ${address || 'localização atual'}`,
        data: {
          type: 'checkin_success',
          location: currentLocation,
        },
      });

      return true;
    } catch (error) {
      console.error('Erro ao registrar check-in:', error);
      return false;
    }
  }

  async registerCheckOut(location?: LocationData): Promise<boolean> {
    try {
      const currentLocation = location || await this.getCurrentLocation();
      if (!currentLocation) return false;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const today = new Date().toISOString().split('T')[0];
      
      const { data: timeRecord } = await supabase
        .from('time_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (!timeRecord) {
        throw new Error('Nenhum check-in encontrado para hoje');
      }

      const clockIn = new Date(timeRecord.clock_in);
      const clockOut = new Date();
      const totalHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);

      const address = await this.reverseGeocode(currentLocation.latitude, currentLocation.longitude);

      await supabase
        .from('time_records')
        .update({
          clock_out: clockOut.toISOString(),
          total_hours: totalHours,
          checkout_location: address || `${currentLocation.latitude}, ${currentLocation.longitude}`,
          checkout_latitude: currentLocation.latitude,
          checkout_longitude: currentLocation.longitude,
        })
        .eq('id', timeRecord.id);

      await notificationService.scheduleLocalNotification({
        title: '🏁 Check-out Registrado',
        body: `Trabalhou ${totalHours.toFixed(1)} horas hoje. Bom descanso!`,
        data: {
          type: 'checkout_success',
          totalHours,
          location: currentLocation,
        },
      });

      return true;
    } catch (error) {
      console.error('Erro ao registrar check-out:', error);
      return false;
    }
  }

  async addTaskLocation(taskId: string, title: string, latitude: number, longitude: number, radius?: number): Promise<void> {
    const address = await this.reverseGeocode(latitude, longitude);
    
    this.taskLocations.push({
      taskId,
      title,
      latitude,
      longitude,
      address: address || undefined,
      radius: radius || 100,
    });
  }

  async removeTaskLocation(taskId: string): Promise<void> {
    this.taskLocations = this.taskLocations.filter(tl => tl.taskId !== taskId);
  }

  async addGeofence(geofence: GeofenceRegion): Promise<void> {
    this.geofences.push(geofence);
    
    // Salvar geofences localmente
    await AsyncStorage.setItem('geofences', JSON.stringify(this.geofences));
  }

  async removeGeofence(geofenceId: string): Promise<void> {
    this.geofences = this.geofences.filter(g => g.id !== geofenceId);
    
    // Atualizar storage local
    await AsyncStorage.setItem('geofences', JSON.stringify(this.geofences));
  }

  async loadGeofences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('geofences');
      if (stored) {
        this.geofences = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar geofences:', error);
    }
  }

  async getLastKnownLocation(): Promise<LocationData | null> {
    try {
      const stored = await AsyncStorage.getItem('lastKnownLocation');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Erro ao obter última localização conhecida:', error);
      return null;
    }
  }
}

export const locationService = new LocationService();