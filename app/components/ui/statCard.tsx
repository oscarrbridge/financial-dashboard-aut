import { Wrapper } from '@/app/components/ui/ui'


type statCardProps = {
    title: string;
    value: string;
}

export default function StatCard({ title, value } : statCardProps) {
  return (
    <>
      <div className="flex flex-col gap-2 flex-1">

        <div><h2 className="font-semibold text-2xl">{title}</h2></div>

        <Wrapper className="h-10">

            <div className='w-full'><p className="text-xl text-left">{value}</p></div>

        </Wrapper>
      </div>
    </>
  );
}
