export function PostsListHeader() {
  return (
    <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-mono text-gray-600 font-bold uppercase tracking-wider border-b border-zzz-gray/30">
      <div className="col-span-1">ID</div>
      <div className="col-span-5">Subject</div>
      <div className="col-span-2">Class</div>
      <div className="col-span-2">Date</div>
      <div className="col-span-2 text-right">Operations</div>
    </div>
  );
}
