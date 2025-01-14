

export default function ProfileTile({ title, children }: { title: string, children: React.ReactNode }) {
  return <div className="bg-white border border-gray-300 rounded-lg relative mt-2 p-6">
  <div className="flex justify-between items-center">
    <h3 className="text-xl font-semibold">{title}</h3>
  </div>
  <div className="text-gray-600 mt-2">
    {children}
  </div>
</div>
}