'use client';

interface CoinSelectorProps {
  coins: string[];
  selected: string;
  onChange: (coin: string) => void;
}

const coinIcons: { [key: string]: string } = {
  'TAG': '/icons/TAG.png',
  'SKYAI': '/icons/SKYAI.png',
  'BANANAS31': '/icons/BANANAS31.png',
  'PLAY': '/icons/PLAY.png',
  'SOLV': '/icons/SOLV.png',
  'PORT3': '/icons/PORT3.png',
};

export default function CoinSelector({ coins, selected, onChange }: CoinSelectorProps) {
  return (
    <div className="space-y-2">
      {coins.map(coin => (
        <button
          key={coin}
          onClick={() => onChange(coin)}
          className={`
            w-full text-left px-4 py-3 rounded-lg font-medium text-sm
            transition-all duration-200 transform
            ${selected === coin
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md scale-105'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:scale-102'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {coinIcons[coin] ? (
                <img 
                  src={coinIcons[coin]} 
                  alt={coin} 
                  className="w-5 h-5 object-contain"
                />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                </svg>
              )}
              <span className="font-bold">{coin}</span>
            </span>
            {selected === coin && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                ✓ 已选
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

