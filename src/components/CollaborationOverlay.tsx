import React from 'react';
import { CollaborationUser } from '../types';
import { Theme } from '../hooks/useTheme';

interface CollaborationOverlayProps {
  collaborators: CollaborationUser[];
  theme: Theme;
}

export const CollaborationOverlay: React.FC<CollaborationOverlayProps> = ({ collaborators, theme }) => {
  if (collaborators.length === 0) {
    return null;
  }

  return (
    <div className={`collaboration-overlay ${theme}`}>
      {collaborators.map(collaborator => {
        if (!collaborator.cursorPosition) {
          return null;
        }
        return (
          <div
            key={`cursor-${collaborator.id}`}
            className="remote-cursor"
            style={{
              left: collaborator.cursorPosition.x,
              top: collaborator.cursorPosition.y,
              borderColor: collaborator.color,
            }}
          >
            <div className="cursor-label" style={{ backgroundColor: collaborator.color }}>
              {collaborator.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};
