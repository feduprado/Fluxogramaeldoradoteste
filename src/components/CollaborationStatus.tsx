import React from 'react';
import { CollaborationUser } from '../types';
import { Users } from 'lucide-react';

interface CollaborationStatusProps {
  collaborators: CollaborationUser[];
  isConnected: boolean;
}

export const CollaborationStatus: React.FC<CollaborationStatusProps> = ({ collaborators, isConnected }) => {
  return (
    <div className="collaboration-status">
      <div className={`status-indicator ${isConnected ? 'online' : 'offline'}`}></div>
      <Users className="icon" size={14} />
      <span className="label">{isConnected ? 'Colaboração ativa' : 'Offline'}</span>
      <div className="avatars">
        {collaborators.slice(0, 3).map(collaborator => (
          <div
            key={collaborator.id}
            className="avatar"
            style={{ backgroundColor: collaborator.color }}
            title={collaborator.name}
          >
            {collaborator.name.slice(0, 2)}
          </div>
        ))}
        {collaborators.length > 3 && (
          <div className="avatar more">+{collaborators.length - 3}</div>
        )}
      </div>
    </div>
  );
};
