import React from 'react';

const UsersPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
        <p className="text-gray-600 mt-1">
          Gerencie os usuários da sua empresa
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Gerenciamento de Usuários
          </h3>
          <p className="text-gray-500 mb-6">
            Esta funcionalidade está em desenvolvimento. Em breve você poderá gerenciar todos os usuários da sua empresa.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Funcionalidades planejadas:</strong>
            </p>
            <ul className="text-sm text-blue-600 mt-2 space-y-1">
              <li>• Visualizar lista de usuários</li>
              <li>• Adicionar novos usuários</li>
              <li>• Editar permissões</li>
              <li>• Gerenciar setores</li>
              <li>• Enviar convites</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;