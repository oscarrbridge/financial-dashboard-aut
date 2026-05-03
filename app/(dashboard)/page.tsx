import { Button, Input, Wrapper} from '@/app/components/ui/ui'

export default function DashboardPage() {
  return (
    <Wrapper>
      <div>Dashboard</div>
      <Button buttonText="hello" />
      <Input placeholder="test placeholder" />
    </Wrapper>
  );
}