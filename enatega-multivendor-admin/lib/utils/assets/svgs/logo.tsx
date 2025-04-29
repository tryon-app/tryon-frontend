import Image from 'next/image';
import tryonLogo from '../../../../public/tryonLogo.png'

export function AppLogo() {
  return (
    <div className="flex items-center justify-center relative p-2">
      <Image src={tryonLogo} width={140} height={40} alt='logo'/>
    </div>
  );
}
