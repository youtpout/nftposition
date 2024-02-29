import Search from "@/components/search";

export default function PositionLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (<div>
        <Search></Search>
        <div>{children}</div>

    </div>)
}