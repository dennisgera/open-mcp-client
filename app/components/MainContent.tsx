'use client';

import React, { useState } from 'react';

import { ChatMPCLangGraph } from "@/components/server-dashboard"

interface MainContentProps {
  children?: React.ReactNode;
}

export const MainContent: React.FC<MainContentProps> = ({ children }) => {

  

  // Form state for adding new services
  const [newServiceName, setNewServiceName] = useState('');
  const [connectionType, setConnectionType] = useState<'stdio' | 'sse'>('stdio');
  const [command, setCommand] = useState('');
  const [args, setArgs] = useState('');
  const [url, setUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Get the current MCP config or initialize an empty one
  const mcpConfig = state?.mcp_config || {};

  // Handler to add a new service
  const handleAddService = () => {
    setFormError('');
    
    // Validate form
    if (!newServiceName.trim()) {
      setFormError('Service name is required');
      return;
    }

    if (mcpConfig[newServiceName]) {
      setFormError('A service with this name already exists');
      return;
    }

    let newService: ServiceConnection;

    if (connectionType === 'stdio') {
      if (!command.trim()) {
        setFormError('Command is required for stdio connections');
        return;
      }
      
      // Create a stdio connection
      newService = {
        command: command.trim(),
        args: args.split(' ').filter(arg => arg.trim() !== ''),
        transport: 'stdio'
      };
    } else {
      if (!url.trim()) {
        setFormError('URL is required for SSE connections');
        return;
      }
      
      // Create an SSE connection
      newService = {
        url: url.trim(),
        transport: 'sse'
      };
    }

    // Update the state with the new service
    const updatedConfig: MCPConfig = {
      ...mcpConfig,
      [newServiceName]: newService
    };

    setState({ ...state, mcp_config: updatedConfig });

    // Reset form
    setNewServiceName('');
    setConnectionType('stdio');
    setCommand('');
    setArgs('');
    setUrl('');
    setIsFormVisible(false);
  };

  // Handler to remove a service
  const handleRemoveService = (serviceName: string) => {
    const updatedConfig = { ...mcpConfig };
    delete updatedConfig[serviceName];
    setState({ ...state, mcp_config: updatedConfig });
  };

  return (
    <div className="w-full h-full flex-1 flex justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-3xl flex flex-col">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-50 p-6 mb-6">
          <header className="mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              MCP Server Configuration
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Configure and manage your MCP service connections
            </p>
          </header>
          
          {/* Current Services Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Configured Services
              </h2>
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <span>{isFormVisible ? 'Cancel' : 'Add New Service'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${isFormVisible ? 'rotate-45' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {Object.keys(mcpConfig).length === 0 ? (
              <div className="bg-gray-50 p-6 rounded-lg text-gray-500 text-center border border-gray-100 flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M12 5v14" />
                </svg>
                <p className="text-gray-400 text-sm mb-1">No services configured yet</p>
                <p className="text-gray-500 text-sm">Add a new MCP service to get started</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {Object.entries(mcpConfig).map(([serviceName, config]) => (
                  <li 
                    key={serviceName}
                    className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 transition-all duration-300 hover:shadow-md hover:border-indigo-100 group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className={`w-9 h-9 flex items-center justify-center rounded-lg mr-3 ${config.transport === 'stdio' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                          {config.transport === 'stdio' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm10.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{serviceName}</h3>
                          <span className={`text-xs uppercase font-medium tracking-wider px-2 py-0.5 rounded-full ${config.transport === 'stdio' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                            {config.transport}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveService(serviceName)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label={`Remove ${serviceName}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {config.transport === 'stdio' ? (
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-gray-500 block mb-1">Command</span>
                            <code className="text-sm bg-gray-50 p-1.5 rounded block truncate">{config.command}</code>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block mb-1">Arguments</span>
                            <code className="text-sm bg-gray-50 p-1.5 rounded block truncate">
                              {config.args.length > 0 ? config.args.join(' ') : <span className="text-gray-400 italic">No arguments</span>}
                            </code>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">URL</span>
                          <code className="text-sm bg-gray-50 p-1.5 rounded block truncate">{config.url}</code>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!isFormVisible && Object.keys(mcpConfig).length > 0 && (
            <div className="flex justify-center mt-4 mb-2">
              <button
                onClick={() => setIsFormVisible(true)}
                className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-full bg-white text-indigo-600 font-medium text-sm hover:bg-indigo-50 transition-all duration-300 border border-indigo-200 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Add Another Service</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Add New Service Form */}
        {isFormVisible && (
          <div className="bg-white rounded-xl shadow-lg border border-indigo-100 p-6 mb-6 transition-all duration-500 animate-fadeIn">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Service
            </h2>
            
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md animate-pulse text-sm">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {formError}
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  id="serviceName"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors duration-200 text-sm"
                  placeholder="Enter service name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connection Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${connectionType === 'stdio' ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      className="sr-only"
                      checked={connectionType === 'stdio'}
                      onChange={() => setConnectionType('stdio')}
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center border transition-all duration-200 ${connectionType === 'stdio' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-400'}`}>
                      {connectionType === 'stdio' && (
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className="block font-medium text-sm text-gray-900">Standard I/O</span>
                      <span className="text-xs text-gray-500">Command-line process</span>
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${connectionType === 'sse' ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      className="sr-only"
                      checked={connectionType === 'sse'}
                      onChange={() => setConnectionType('sse')}
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center border transition-all duration-200 ${connectionType === 'sse' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-400'}`}>
                      {connectionType === 'sse' && (
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className="block font-medium text-sm text-gray-900">Server-Sent Events</span>
                      <span className="text-xs text-gray-500">HTTP streaming</span>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 transition-all duration-300">
                {connectionType === 'stdio' ? (
                  <>
                    <div className="mb-3">
                      <label htmlFor="command" className="block text-sm font-medium text-gray-700 mb-1">
                        Command
                      </label>
                      <input
                        type="text"
                        id="command"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors duration-200 text-sm"
                        placeholder="e.g., python"
                      />
                    </div>
                    <div>
                      <label htmlFor="args" className="block text-sm font-medium text-gray-700 mb-1">
                        Arguments (space separated)
                      </label>
                      <input
                        type="text"
                        id="args"
                        value={args}
                        onChange={(e) => setArgs(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors duration-200 text-sm"
                        placeholder="e.g., script.py --flag"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                      URL
                    </label>
                    <input
                      type="text"
                      id="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors duration-200 text-sm"
                      placeholder="e.g., http://localhost:8000/events"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsFormVisible(false)}
                className="mr-3 px-3 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddService}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
              >
                Add Service
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add animation keyframes via CSS classes
// Add this to your CSS or in a <style> tag
// .animate-fadeIn {
//   animation: fadeIn 0.5s ease-in-out;
// }
// @keyframes fadeIn {
//   from { opacity: 0; transform: translateY(10px); }
//   to { opacity: 1; transform: translateY(0); }
// } 