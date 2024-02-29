import Search from "@/components/search";
import SideNav from '@/pages/position/sidenav';

export default function PositionLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (<div>
        <Search></Search>
        <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>

    </div>)
}