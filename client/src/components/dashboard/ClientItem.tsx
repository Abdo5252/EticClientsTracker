import { cn, formatCurrency } from '@/lib/utils';
import { generateInitials } from '@/lib/utils';

interface ClientItemProps {
  name: string;
  code: string;
  balance: number;
  currency: string;
}

export function ClientItem({ name, code, balance, currency }: ClientItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center ml-3 text-blue-800 font-bold">
          {generateInitials(name)}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-xs text-gray-700">كود: {code}</p>
        </div>
      </div>
      <div className="text-left">
        <span className="block font-bold">{balance.toLocaleString('ar-EG')}</span>
        <span className="text-xs text-gray-700">{currency}</span>
      </div>
    </div>
  );
}
