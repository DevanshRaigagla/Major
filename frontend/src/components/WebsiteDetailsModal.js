import React, { useContext, useEffect } from 'react';
import { X, Activity } from 'lucide-react';
import Connect_Context from '../context/ConnectContext';

export default function WebsiteDetailsModal({ open, onClose, website }) {
  const { metrics, fetchMetricsForWebsite, incidents = [] } = useContext(Connect_Context);

  useEffect(() => {
    if (open && website) {
      fetchMetricsForWebsite(website.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, website]);

  if (!open || !website) return null;

  const siteMetrics = metrics[website.id] || [];
  const chartData = [...siteMetrics].reverse();
  const siteIncidents = incidents.filter(i => i.websiteId === website.id);

  // SVG Dimensions
  const width = 750;
  const height = 280;
  const paddingX = 100; // Increased to 100 to prevent overlap with large numbers
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  
  const minTime = chartData.length > 0 ? new Date(chartData[0].createdAt).getTime() : Date.now() - 3600000;
  const maxTimeX = chartData.length > 0 ? new Date(chartData[chartData.length - 1].createdAt).getTime() : Date.now();
  const timeRange = Math.max(1000, maxTimeX - minTime);

  const maxResponseTime = Math.max(500, ...chartData.map(m => m.responseTimeMs || 0));
  // Provide 10% headroom
  const maxTime = Math.ceil(maxResponseTime * 1.1);

  const mapX = (timeStr) => {
    const t = new Date(timeStr).getTime();
    return paddingX + ((t - minTime) / timeRange) * (width - paddingX - paddingRight);
  };

  const mapY = (val) => {
    return height - paddingBottom - (val / maxTime) * (height - paddingTop - paddingBottom);
  };

  const pointsStr = chartData.map(d => `${mapX(d.createdAt)},${mapY(d.responseTimeMs || 0)}`).join(' ');
  const areaPoints = chartData.length > 0 
    ? `${mapX(chartData[0].createdAt)},${height - paddingBottom} ${pointsStr} ${mapX(chartData[chartData.length-1].createdAt)},${height - paddingBottom}`
    : '';

  // X Axis formatters
  const formatTimeLabel = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="text-blue-500" />
              {website.name} Live Performance Analytics
            </h2>
            <p className="text-sm text-gray-400 mt-1">{website.url}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-6 flex gap-12 border-b border-gray-800 pb-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Ping</p>
              <p className="text-3xl font-bold text-white flex items-baseline gap-1">
                {chartData.length > 0 ? chartData[chartData.length - 1].responseTimeMs : '--'}
                <span className="text-sm font-medium text-gray-400">ms</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Live Status</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-4 h-4 rounded-full shadow-[0_0_10px_currentColor] ${website.status === 'online' ? 'bg-green-500 text-green-500' : website.status === 'warning' ? 'bg-yellow-500 text-yellow-500' : 'bg-red-500 text-red-500'}`} />
                <span className="font-semibold text-white capitalize text-lg tracking-wide">{website.status || 'unknown'}</span>
              </div>
            </div>
          </div>

          {/* SVG Graph */}
          <div className="bg-gray-950 rounded-xl p-4 border border-gray-800 shadow-inner relative">
            <h3 className="text-sm text-gray-400 font-semibold mb-6 flex items-center gap-2">
              Response Time vs Time
              <span className="text-xs font-normal px-2 py-0.5 bg-gray-800 rounded-full text-gray-400">Auto-updating</span>
            </h3>
            
            {chartData.length === 0 ? (
              <div className="h-[280px] flex flex-col items-center justify-center text-gray-500">
                <Activity className="animate-pulse mb-3 opacity-50" size={32} />
                <p>Waiting for live stream data...</p>
              </div>
            ) : (
              <div className="relative w-full overflow-hidden" style={{ height: '280px' }}>
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-aspect-ratio-none">
                  
                  <defs>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  {/* Incident Highlights (Downtimes) */}
                  {siteIncidents.map((inc, i) => {
                    const startT = new Date(inc.startedAt).getTime();
                    const endT = inc.isResolved && inc.resolvedAt ? new Date(inc.resolvedAt).getTime() : maxTimeX;
                    
                    if (endT < minTime || startT > maxTimeX) return null;
                    
                    const clampedStart = Math.max(minTime, startT);
                    const clampedEnd = Math.min(maxTimeX, endT);
                    
                    const x1 = mapX(clampedStart);
                    const x2 = mapX(clampedEnd);
                    const rectWidth = Math.max(2, x2 - x1);

                    return (
                      <g key={'inc-'+i}>
                        <rect
                          x={x1}
                          y={paddingTop}
                          width={rectWidth}
                          height={height - paddingTop - paddingBottom}
                          fill="url(#redGradient)"
                        />
                        <line 
                          x1={x1} y1={paddingTop} x2={x1} y2={height - paddingBottom} 
                          stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" opacity="0.8" 
                        />
                        <text x={x1 + 4} y={paddingTop + 14} fill="#ef4444" fontSize="10" fontWeight="bold">INCIDENT DOWNTIME</text>
                        {inc.isResolved && (
                          <line 
                            x1={x2} y1={paddingTop} x2={x2} y2={height - paddingBottom} 
                            stroke="#22c55e" strokeWidth="1" strokeDasharray="4 2" opacity="0.8" 
                          />
                        )}
                      </g>
                    );
                  })}

                  {/* Grid lines and Y Axis labels */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = height - paddingBottom - ratio * (height - paddingTop - paddingBottom);
                    const val = Math.round(maxTime * ratio);
                    return (
                      <g key={'y-'+ratio}>
                        <line x1={paddingX} y1={y} x2={width - paddingRight} y2={y} stroke="#374151" strokeWidth="1" strokeDasharray={ratio === 0 ? "" : "3 3"} />
                        <text x={paddingX - 15} y={y + 4} fill="#9ca3af" fontSize="11" textAnchor="end">{val} ms</text>
                      </g>
                    );
                  })}
                  
                  {/* Y Axis Title */}
                  <text 
                    x={-(height / 2)} 
                    y={15} 
                    transform="rotate(-90)" 
                    fill="#9ca3af" 
                    fontSize="11" 
                    fontWeight="bold"
                    textAnchor="middle"
                    letterSpacing="1"
                  >
                    RESPONSE TIME
                  </text>

                  {/* X Axis Title */}
                  <text 
                    x={width / 2} 
                    y={height - 5} 
                    fill="#9ca3af" 
                    fontSize="11" 
                    fontWeight="bold"
                    textAnchor="middle"
                    letterSpacing="1"
                  >
                    TIME
                  </text>

                  {/* X Axis labels */}
                  {[0, 0.33, 0.66, 1].map((ratio) => {
                    const t = minTime + ratio * timeRange;
                    const x = mapX(t);
                    return (
                      <g key={'x-'+ratio}>
                        <line x1={x} y1={height - paddingBottom} x2={x} y2={height - paddingBottom + 5} stroke="#6b7280" strokeWidth="1" />
                        <text x={x} y={height - paddingBottom + 18} fill="#9ca3af" fontSize="10" textAnchor="middle">
                          {formatTimeLabel(t)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Gradient Area */ }
                  <polygon
                    fill="url(#greenGradient)"
                    points={areaPoints}
                  />

                  {/* Line */ }
                  <polyline
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pointsStr}
                    style={{ filter: "drop-shadow(0px 4px 6px rgba(34,197,94,0.3))" }}
                  />

                  {/* Points */ }
                  {chartData.map((d, i) => {
                    // Check if point falls within any incident
                    let isIncident = false;
                    const ds = new Date(d.createdAt).getTime();
                    siteIncidents.forEach(inc => {
                      const startT = new Date(inc.startedAt).getTime();
                      const endT = inc.isResolved && inc.resolvedAt ? new Date(inc.resolvedAt).getTime() : maxTimeX;
                      if (ds >= startT && ds <= endT) isIncident = true;
                    });

                    return (
                      <circle
                        key={d.id || i}
                        cx={mapX(d.createdAt)}
                        cy={mapY(d.responseTimeMs || 0)}
                        r={isIncident ? "4" : "3"}
                        fill={isIncident ? "#ef4444" : "#10b981"}
                        stroke={isIncident ? "#7f1d1d" : "#064e3b"}
                        strokeWidth="1.5"
                        className="transition-all duration-300 hover:r-[6px]"
                      >
                        <title>{`${d.responseTimeMs}ms at ${formatTimeLabel(d.createdAt)}${isIncident ? ' (DOWNTIME)' : ''}`}</title>
                      </circle>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}