interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color: 'green' | 'yellow' | 'blue' | 'red';
    action?: {
        label: string;
        href: string;
    };
}

const colorClasses = {
    green: 'border-green-300 bg-green-50',
    yellow: 'border-yellow-300 bg-yellow-50',
    blue: 'border-blue-300 bg-blue-50',
    red: 'border-red-300 bg-red-50',
};

const buttonClasses = {
    green: 'bg-green-100 text-green-700 hover:bg-green-200',
    yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    red: 'bg-red-100 text-red-700 hover:bg-red-200',
};

export default function StatsCard({ title, value, subtitle, icon, color, action }: StatsCardProps) {
    return (
        <div className={`rounded-lg border-2 ${colorClasses[color]} p-6`}>
            <div className="flex flex-col items-center text-center">
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                <p className="text-sm font-medium text-gray-700 mt-1">{title}</p>
                {subtitle && (
                    <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
                )}
                {action && (
                    <a
                        href={action.href}
                        className={`mt-4 px-4 py-2 rounded-md text-sm font-medium ${buttonClasses[color]} transition-colors`}
                    >
                        {action.label} →
                    </a>
                )}
            </div>
        </div>
    );
}