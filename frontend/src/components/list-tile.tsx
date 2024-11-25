
type ListTileProps = {
  title: string;
  subtitle: string;
  imageSrc: string;
  endChildren?: React.ReactNode;
  children?: React.ReactNode;
}

export default function ListTile({ title, subtitle, imageSrc, endChildren, children }: ListTileProps) {
    return (
<div className="w-full max-w-md bg-white border border-gray-300 rounded-3xl relative">
    <div className="px-2 py-[0.25rem] flex items-center">
      <div className="w-full flex gap-2 items-center">
        <img className="h-8 w-8 rounded-full overflow-hidden object-cover" src={imageSrc} alt="" />
        <div>
          <div className="font-bold text-sm">{title}</div>
          <div className="font-normal text-xs text-gray-500">{subtitle}</div>
        </div>
      </div>
      {endChildren}
    </div>
    {children}
</div>
    )

}