import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { Users, RefreshCw } from 'lucide-react';

export default function LiveQueuePage() {
  const { shopId, serviceId } = useParams();
  const { socket } = useSocket();
  const [queueData, setQueueData] = useState({ queue: [], currentToken: null });
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const { data } = await api.get(`/queue/live/${shopId}/${serviceId}`);
      setQueueData(data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchQueue().finally(() => setLoading(false));
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, [shopId, serviceId]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join_shop', shopId);
    socket.on('token_called', fetchQueue);
    socket.on('queue_updated', fetchQueue);
    socket.on('new_token', fetchQueue);
    return () => {
      socket.off('token_called');
      socket.off('queue_updated');
      socket.off('new_token');
    };
  }, [socket, shopId]);

  const { queue, currentToken } = queueData;
  const waiting = queue.filter(t => t.status === 'waiting');

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Live Queue</h1>
        <button onClick={fetchQueue} className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50">
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Now Serving */}
      {currentToken ? (
        <div className="card bg-lavender text-white text-center">
          <p className="text-lavender-100 text-sm font-medium mb-2">NOW SERVING</p>
          <div className="text-5xl font-bold mb-1 token-pulse inline-block bg-white text-lavender-600 w-28 h-28 rounded-full flex items-center justify-center mx-auto">
            {currentToken.tokenNumber}
          </div>
        </div>
      ) : (
        <div className="card text-center py-8 bg-gray-50">
          <p className="text-gray-400 font-medium">No one currently being served</p>
        </div>
      )}

      {/* Queue Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center p-4">
          <div className="text-3xl font-bold text-lavender-500">{waiting.length}</div>
          <div className="text-xs text-gray-500 mt-1">Waiting</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-3xl font-bold text-blue-500">
            {waiting.length > 0 ? `~${waiting.length * 15}` : '0'}
          </div>
          <div className="text-xs text-gray-500 mt-1">Est. Wait (min)</div>
        </div>
      </div>

      {/* Queue List */}
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-lavender-400" />
          Waiting Queue ({waiting.length})
        </h3>
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : waiting.length === 0 ? (
          <p className="text-center text-gray-400 py-6">Queue is empty 🎉</p>
        ) : (
          <div className="space-y-2">
            {waiting.map((token, idx) => (
              <div key={token._id}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  idx === 0 ? 'bg-lavender-50 border border-lavender-200' : 'bg-gray-50'
                }`}>
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-lavender-400 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>{idx + 1}</span>
                  <span className={`font-bold ${idx === 0 ? 'text-lavender-700' : 'text-gray-700'}`}>
                    {token.tokenNumber}
                  </span>
                  {idx === 0 && <span className="text-xs text-lavender-500 font-medium">Up Next</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
