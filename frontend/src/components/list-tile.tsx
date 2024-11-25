import { Link } from 'react-router-dom';

type ListTileProps = {
  title: string;
  subtitle: string;
  imageSrc: string;
  href: string;
  endChildren?: React.ReactNode;
  children?: React.ReactNode;
}

export default function ListTile({ title, subtitle, imageSrc, href, endChildren, children }: ListTileProps) {
    return (
<div className="w-full max-w-md bg-white border border-gray-300 rounded-3xl relative">
    <div className="px-2 py-[0.25rem] flex items-center">
      <Link to={href} className="w-full flex gap-2 items-center text-black group hover:cursor-pointer">
        <img className="h-8 w-8 rounded-full overflow-hidden object-cover" src={imageSrc} alt="" />
        <div>
          <div className="font-bold text-sm group-hover:underline">{title}</div>
          <div className="font-normal text-xs text-gray-500">{subtitle}</div>
        </div>
      </Link>
      {endChildren}
    </div>
    {children}
</div>
    )

}