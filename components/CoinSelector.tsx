'use client';

interface CoinSelectorProps {
  coins: string[];
  selected: string;
  onChange: (coin: string) => void;
}

export default function CoinSelector({ coins, selected, onChange }: CoinSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3">📋 选择币种</h3>
      <div className="space-y-2">
        {coins.map(coin => (
          <button
            key={coin}
            onClick={() => onChange(coin)}
            className={`w-full text-left px-4 py-2 rounded transition-colors ${
              selected === coin
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {coin}
          </button>
        ))}
      </div>
    </div>
  );
}

