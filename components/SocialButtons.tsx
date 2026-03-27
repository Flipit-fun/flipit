import React from 'react';

export default function SocialButtons() {
    return (
        <div className="flex items-center gap-6">
            <a
                href="https://x.com/FlipItCasino"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black transition-colors duration-200"
                title="Follow on X"
            >
                <svg width="20" height="20" viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6943H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="currentColor" />
                </svg>
            </a>
            <a
                href="https://github.com/Flipit-fun/flipit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black transition-colors duration-200"
                title="View Source"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12C0 17.31 3.438 21.82 8.205 23.41C8.805 23.52 9.025 23.15 9.025 22.84C9.025 22.56 9.015 21.81 9.01 20.84C5.67 21.57 4.965 19.41 4.965 19.41C4.42 18.02 3.63 17.65 3.63 17.65C2.54 16.91 3.715 16.93 3.715 16.93C4.92 17.01 5.555 18.17 5.555 18.17C6.625 20.01 8.365 19.48 9.05 19.17C9.16 18.39 9.475 17.86 9.82 17.56C7.155 17.26 4.355 16.23 4.355 11.62C4.355 10.31 4.82 9.24 5.585 8.4C5.46 8.1 5.05 6.88 5.7 5.24C5.7 5.24 6.705 4.92 9 6.47C9.955 6.205 10.975 6.07 11.995 6.065C13.015 6.07 14.035 6.205 14.99 6.47C17.285 4.92 18.29 5.24 18.29 5.24C18.94 6.88 18.53 8.1 18.405 8.4C19.175 9.24 19.635 10.31 19.635 11.62C19.635 16.24 16.83 17.25 14.155 17.55C14.585 17.92 14.97 18.66 14.97 19.8C14.97 21.43 14.955 22.75 14.955 23.14C14.955 23.46 15.17 23.83 15.775 23.71C20.535 22.12 24 17.61 24 12C24 5.37 18.63 0 12 0Z" fill="currentColor" />
                </svg>
            </a>
        </div>
    );
}
