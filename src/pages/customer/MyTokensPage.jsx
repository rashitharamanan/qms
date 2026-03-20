import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Ticket, Clock, ChevronRight, Store } from 'lucide-react';

const badgeClass = {
  waiting: 'badge-waiting',
  called: 'badge-called',
  'in-service': 'badge-in-service',
  completed: 'badge-completed',
  skipped: 'badge-skipped',
  cancelled: 'badge-cancelled',
};

export default function MyTokensPage() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/queue/my-tokens').then(r => setTokens(r.data.tokens || [])).finally(() => setLoading(false));
  }, []);

  const active = tokens.filter(t => ['waiting', 'called', 'in-service'].includes(t.status));
  const past = tokens.filter(t => !['waiting', 'called', 'in-service'].includes(t.status));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tokens</h1>
        <p className="text-gray-500 mt-1">Today's queue tokens</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-24" />)}
        </div>
      ) : tokens.length === 0 ? (
        <div className="card text-center py-16">
          <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <p className="font-semibold text-gray-400">No tokens today</p>
          <p className="text-sm text-gray-400 mt-1">Browse shops to join a queue</p>
          <Link to="/shops" className="btn-primary inline-block mt-6">Browse Shops</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Active ({active.length})
              </h2>
              <div className="space-y-3">
                {active.map(t => <TokenCard key={t._id} token={t} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-500 mb-3">Past Tokens ({past.length})</h2>
              <div className="space-y-3">
                {past.map(t => <TokenCard key={t._id} token={t} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TokenCard({ token }) {
  return (
    <Link to={`/token/${token._id}`} className="card flex items-center justify-between hover:shadow-md transition-all border hover:border-lavender-200 group">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-lavender-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-lavender-700 font-bold text-lg">{token.tokenNumber}</span>
        </div>
        <div>
          <div className="font-bold text-gray-900">{token.shopId?.shopName}</div>
          <div className="text-sm text-gray-500">{token.serviceId?.serviceName}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={badgeClass[token.status]}>
              {token.status === 'in-service' ? 'In Service' :
               token.status.charAt(0).toUpperCase() + token.status.slice(1)}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(token.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-lavender-500 transition-colors flex-shrink-0" />
    </Link>
  );
}
