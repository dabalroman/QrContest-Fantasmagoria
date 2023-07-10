export default function CardSmallHiddenComponent ({
    className = ''
}: { className?: string }) {
    return (
        <div
            className={
                'border-4 border-gray-600 rounded-xl bg-background relative bg-center bg-cover shadow-card'
                + ' ' + className
            }
            style={{
                'backgroundImage': `url(/cards/hidden.jpg)`,
                'height': '8.25rem',
                'width': '5.5rem'
            }}
        >
        </div>
    );
}
