const Logo = () => {
  return (
    <div className="p-6 border-b border-gray-100">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-light">EV</span>
        </div>
        <div>
          <h1 className="text-lg font-light text-gray-900">EV Lite</h1>
          <p className="text-xs text-gray-500 font-light">Charging Network</p>
        </div>
      </div>
    </div>
  );
};

export default Logo;
