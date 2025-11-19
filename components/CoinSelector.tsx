'use client';

interface CoinSelectorProps {
  coins: string[];
  selected: string;
  onChange: (coin: string) => void;
}

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
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md scale-105'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:scale-102'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-lg">💰</span>
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

