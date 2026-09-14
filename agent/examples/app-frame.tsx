import { AppFrame } from '@package/pro/app-frame';
export function WorkspaceExample() {
    return <AppFrame title='Studio' navItems={[{ label: 'Projects', to: '/projects' }]} pathname='/projects' classNames={{ content: 'p-8 md:p-8', sidebar: 'w-72' }}>
    <h1 className='text-xl font-semibold'>Projects</h1>
  </AppFrame>;
}
