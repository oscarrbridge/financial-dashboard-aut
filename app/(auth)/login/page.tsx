import { Wrapper, Button, Input } from '@/app/components/ui/ui'

export default function LoginPage() {
  return (
    <div className='w-fit h-screen flex items-center'>
      <Wrapper>
        <div>Dashboard</div>
        <Input placeholder="Full Name" />
        <Input placeholder="Password" />
        <Button buttonText="Login" />
      </Wrapper>
    </div>
  );
}