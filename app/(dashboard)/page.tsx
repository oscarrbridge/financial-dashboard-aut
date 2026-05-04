import { Button, Input, Wrapper, MultiSelect } from '@/app/components/ui/ui'

export default function DashboardPage() {
  return (
    <Wrapper>
      <div>Dashboard</div>
      <Button buttonText="hello" />
      <Input placeholder="test placeholder" />
      <MultiSelect options={["Option1", "Option2", "Option3"]}/>
    </Wrapper>
  );
}