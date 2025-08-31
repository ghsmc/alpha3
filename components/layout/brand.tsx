import Link from 'next/link';

import { VersionBadge } from '@/components/layout/version-badge';

export const Brand = () => {
    return (
        <div className='flex items-center justify-between px-3'>
            <Link href='/' className='text-lg font-semibold text-blue-600 dark:text-blue-400'>
                Milo Wayfinder
            </Link>
            <VersionBadge />
        </div>
    );
};
