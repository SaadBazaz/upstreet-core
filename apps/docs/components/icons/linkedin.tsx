import Link from 'next/link';
import React from 'react';
import type { SVGProps } from 'react';

export function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <div className='w-fit h-fit p-2 rounded-lg border-[1px] border-[#0a66c2] hover:bg-[#0a66c2]/20 cursor-pointer'>
            <Link href="https://www.linkedin.com/company/upstreetai/" target='_blank'>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256" {...props}><path fill="#0a66c2" d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4c-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.91 39.91 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186zM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009s9.851-22.014 22.008-22.016c12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97zM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453"></path></svg>
            </Link>
        </div>
    );
}