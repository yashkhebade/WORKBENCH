import React from 'react';
import { useSocket } from '../contexts/SocketContext';

export default function PresenceWidget() {
    const { onlineUsers } = useSocket();
    
    if (!onlineUsers || onlineUsers.length === 0) return null;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Online:</span>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
                {onlineUsers.map(u => (
                    <div 
                        key={u.id} 
                        title={`${u.name} (${u.role})`}
                        style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            background: 'var(--accent)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 'bold', 
                            boxShadow: '0 0 0 2px #22c55e'
                        }}
                    >
                        {u.name.charAt(0).toUpperCase()}
                    </div>
                ))}
            </div>
        </div>
    );
}
