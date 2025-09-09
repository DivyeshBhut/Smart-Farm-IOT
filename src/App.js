import React, { useState, useEffect, useMemo } from 'react';
import { 
  Droplets, Thermometer, Wind, Power, AlertTriangle, Sun, Moon, MapPin, Zap, ZapOff
} from 'lucide-react';

// Main Dashboard Component
const SmartFarmDashboard = () => {
  // ThingSpeak API Configuration
  const CHANNEL_ID = '3066267'; 
  const READ_API_KEY = 'HJL5FUCDWM78HLT6'; 
  
  // State for sensor data
  const [data, setData] = useState({
    soilMoisture: 0,
    temperature: 0,
    humidity: 0,
    pumpState: 0,
    lastUpdated: null
  });

  // State for UI theme (light/dark)
  const [theme, setTheme] = useState('dark');
  
  // State for the live clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Effect to apply the theme to the document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Effect for the live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data from ThingSpeak API
  const fetchData = async () => {
    try {
      const response = await fetch(`https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?api_key=${READ_API_KEY}&results=1`);
      if (!response.ok) throw new Error(`API call failed: ${response.status}`);
      
      const result = await response.json();
      if (!result.feeds || result.feeds.length === 0) {
        console.warn("ThingSpeak API returned no data.");
        return;
      }
      
      const latestFeed = result.feeds[0];
      setData({
        soilMoisture: parseFloat(latestFeed.field1) || 0,
        temperature: parseFloat(latestFeed.field2) || 0,
        humidity: parseFloat(latestFeed.field3) || 0,
        pumpState: parseInt(latestFeed.field4) || 0,
        lastUpdated: new Date(latestFeed.created_at)
      });
    } catch (error) {
      console.error('Error fetching ThingSpeak data:', error);
    }
  };
  
  // Effect for auto-refreshing data
  useEffect(() => {
    fetchData();
    const sensorInterval = setInterval(fetchData, 15000); // Refresh sensors every 15s
    return () => {
      clearInterval(sensorInterval);
    };
  }, []);

  // Function to determine status and colors based on sensor values
  const getStatusInfo = (type, value) => {
    const statuses = {
      soil: {
        critical: value < 30,
        warning: value < 40,
        colors: { critical: 'red', warning: 'orange', optimal: 'green' }
      },
      temp: {
        critical: value < 15 || value > 35,
        warning: value < 20 || value > 30,
        colors: { critical: 'red', warning: 'orange', optimal: 'blue' }
      },
      humidity: {
        critical: value < 25 || value > 90,
        warning: value < 35 || value > 80,
        colors: { critical: 'cyan', warning: 'orange', optimal: 'cyan' }
      },
      default: {
        colors: { optimal: 'gray' }
      }
    };

    const current = statuses[type] || statuses.default;
    let status = 'Optimal';
    let color = current.colors.optimal;

    if (current.critical) {
      status = 'Critical';
      color = current.colors.critical;
    } else if (current.warning) {
      status = 'Warning';
      color = current.colors.warning;
    }

    const colorMap = {
      red:    { gradient: 'from-red-500 to-red-600',       text: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20',       shadow: 'hover:shadow-red-500/30' },
      orange: { gradient: 'from-orange-400 to-orange-500', text: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', shadow: 'hover:shadow-orange-400/30' },
      green:  { gradient: 'from-green-500 to-emerald-500', text: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20',   shadow: 'hover:shadow-green-500/30' },
      blue:   { gradient: 'from-blue-500 to-blue-600',     text: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20',     shadow: 'hover:shadow-blue-500/30' },
      cyan:   { gradient: 'from-cyan-400 to-sky-500',      text: 'text-cyan-500',   bg: 'bg-cyan-50 dark:bg-cyan-900/20',     shadow: 'hover:shadow-cyan-400/30' },
      gray:   { gradient: 'from-slate-500 to-slate-600',   text: 'text-slate-500',  bg: 'bg-slate-50 dark:bg-slate-900/20',   shadow: 'hover:shadow-slate-500/30' }
    };
    
    return { status, ...colorMap[color] };
  };
  
    // Calculate system status summary
    const systemStatus = useMemo(() => {
        const statuses = [
            getStatusInfo('soil', data.soilMoisture).status,
            getStatusInfo('humidity', data.humidity).status,
            getStatusInfo('temp', data.temperature).status,
        ];
        return {
            optimal: statuses.filter(s => s === 'Optimal').length,
            warning: statuses.filter(s => s === 'Warning').length,
            critical: statuses.filter(s => s === 'Critical').length,
        };
    }, [data]);
  
    // Dynamic greeting based on time
    const greeting = useMemo(() => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    }, [currentTime]);

  // Reusable Sensor Card Component
  const SensorCard = ({ title, value, unit, icon: Icon, type }) => {
    const statusInfo = getStatusInfo(type, value);

    return (
      <div className={`group relative overflow-hidden rounded-3xl backdrop-blur-lg bg-white/60 dark:bg-slate-800/40 border border-slate-300/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${statusInfo.shadow}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${statusInfo.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
        
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${statusInfo.gradient} shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
                <p className={`text-sm font-medium ${statusInfo.text}`}>{statusInfo.status}</p>
              </div>
            </div>
            {statusInfo.status !== 'Optimal' && (
              <div className={`p-2 rounded-full ${statusInfo.bg}`}>
                <AlertTriangle className={`w-5 h-5 ${statusInfo.text}`} />
              </div>
            )}
          </div>
          <div className="py-8 text-center">
            <div className="flex items-baseline justify-center space-x-2">
              <span className={`font-black bg-gradient-to-br ${statusInfo.gradient} bg-clip-text text-transparent text-5xl sm:text-6xl`}>
                {typeof value === 'number' ? value.toFixed(1) : value}
              </span>
              <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">{unit}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Theme Toggle Button Component
  const ThemeToggle = () => (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="p-2 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
      aria-label="Toggle theme"
    >
      <Sun className="h-6 w-6 text-slate-800 dark:hidden" />
      <Moon className="h-6 w-6 text-slate-200 hidden dark:block" />
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <Droplets className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
                  {greeting}
                </h1>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Here's your farm's live status.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Combined Status Bar */}
        <div className="mb-6 rounded-3xl backdrop-blur-lg bg-white/60 dark:bg-slate-800/40 border border-slate-300/50 dark:border-slate-700/50 shadow-lg p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Last Sensor Reading</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
                {data.lastUpdated ? data.lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}
              </p>
            </div>
            <div className="w-full sm:w-px h-px sm:h-16 bg-slate-300 dark:bg-slate-700"></div>
            <div className="text-center sm:text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Pump System</p>
                <div className={`inline-flex items-center justify-center gap-2 text-2xl sm:text-3xl font-bold ${data.pumpState === 1 ? 'text-green-500' : 'text-slate-500'}`}>
                    <Power className="w-7 h-7" />
                    <span>{data.pumpState === 1 ? 'ACTIVE' : 'INACTIVE'}</span>
                </div>
            </div>
          </div>
        </div>

        {/* System Status Summary */}
        <div className="mb-6 rounded-3xl backdrop-blur-lg bg-white/60 dark:bg-slate-800/40 border border-slate-300/50 dark:border-slate-700/50 shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 text-center sm:text-left">System Status</h3>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center sm:text-left">
                    {systemStatus.warning === 0 && systemStatus.critical === 0 ? (
                        <p className="text-xl sm:text-2xl font-bold text-green-500">All Systems Nominal</p>
                    ) : (
                        <p className="text-xl sm:text-2xl font-bold text-orange-500">Action Recommended</p>
                    )}
                </div>
                <div className="hidden sm:block w-px h-12 bg-slate-300 dark:bg-slate-700"></div>
                <div className="flex justify-around w-full sm:w-auto gap-4 sm:gap-8 text-center">
                    <div>
                        <p className="text-2xl sm:text-3xl font-bold text-green-500">{systemStatus.optimal}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Optimal</p>
                    </div>
                    <div>
                        <p className="text-2xl sm:text-3xl font-bold text-orange-500">{systemStatus.warning}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Warnings</p>
                    </div>
                    <div>
                        <p className="text-2xl sm:text-3xl font-bold text-red-500">{systemStatus.critical}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Critical</p>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Responsive Sensor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SensorCard title="Soil Moisture" value={data.soilMoisture} unit="%" icon={Droplets} type="soil" />
            <SensorCard title="Humidity" value={data.humidity} unit="%" icon={Wind} type="humidity" />
            <SensorCard title="Temperature" value={data.temperature} unit="°C" icon={Thermometer} type="temp" />
        </div>

        {/* Pump Automation Logic */}
        <div className="mt-6 rounded-3xl backdrop-blur-lg bg-white/60 dark:bg-slate-800/40 border border-slate-300/50 dark:border-slate-700/50 shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 text-center sm:text-left">Pump Automation Logic</h3>
            <div className="space-y-4">
                {/* ON Condition */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex-shrink-0">
                        <Zap className="w-8 h-8 text-green-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-green-600 dark:text-green-400">Pump Activates (ON)</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                            The pump turns ON automatically when <strong className="text-slate-700 dark:text-slate-100">Soil Moisture</strong> is <strong className="text-red-500">Critical</strong> (below 30%).
                        </p>
                    </div>
                </div>
                {/* OFF Condition */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700">
                    <div className="flex-shrink-0">
                        <ZapOff className="w-8 h-8 text-slate-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-600 dark:text-slate-400">Pump Deactivates (OFF)</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                            The pump turns OFF automatically once <strong className="text-slate-700 dark:text-slate-100">Soil Moisture</strong> is <strong className="text-green-500">Optimal</strong> (40% or higher).
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
        <div className="flex items-center justify-center space-x-2">
           <MapPin className="w-4 h-4" />
           <span>Nashik, Maharashtra</span>
           <span className="text-slate-300 dark:text-slate-600">•</span>
           <span>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
           <span className="text-slate-300 dark:text-slate-600">•</span>
           <span>@ Divyesh Bhut</span>
        </div>
      </footer>
    </div>
  );
};

export default SmartFarmDashboard;

