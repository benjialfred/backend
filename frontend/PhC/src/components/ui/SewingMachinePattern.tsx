

const SewingMachinePattern = ({ opacity = 0.05, color = "currentColor" }: { opacity?: number, color?: string }) => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <svg width="100%" height="100%">
            <defs>
                <pattern id="sewing-machine-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                    {/* Simplified Sewing Machine Icon */}
                    <path
                        d="M20 18H4v-2h16v2zm-2-4h-2v-4h2v4zm-4 0h-2v-4h2v4zm6-9V4h-3V2h-2v2H9c-1.1 0-2 .9-2 2v9h13V5z"
                        fill={color}
                        transform="scale(1.2) translate(10, 10)"
                    />
                    {/* Small Needle detail */}
                    <rect x="23" y="12" width="2" height="6" fill={color} opacity="0.7" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sewing-machine-pattern)" style={{ opacity: opacity }} />
        </svg>
    </div>
);

export default SewingMachinePattern;
