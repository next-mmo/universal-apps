import { getTodoStore } from '@package/tauri-api/src/todo-storage';
import { greet } from '@package/tauri-api/src/greet';
import { isTauri } from '@package/tauri-api/src/is-tauri';
import { TodoApp } from '@package/ui/src/todo-app';
import { useState } from 'react';
import reactLogo from './assets/react.svg';
import './index.css';

const todoStore = getTodoStore();

function App() {
  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');

  async function runGreet() {
    setGreetMsg(await greet(name));
  }

  return (
    <main className='m-0 flex min-h-screen items-center justify-center bg-[#f6f6f6] text-center font-[Inter,Avenir,Helvetica,Arial,sans-serif] text-base leading-6 font-normal text-[#0f0f0f] dark:bg-[#2f2f2f] dark:text-[#f6f6f6]'>
      <div className='flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-10'>
        <h1 className='text-center'>Universal Todos</h1>

        <p className='m-0 rounded-full bg-white px-4 py-1 text-sm shadow-[0_2px_6px_rgba(0,0,0,0.08)] dark:bg-[#0f0f0f98]'>
          Running in {isTauri() ? 'Tauri desktop' : 'the browser'} — same codebase
        </p>

        <div className='flex justify-center'>
          <a
            href='https://vite.dev'
            target='_blank'
            className='font-medium text-[#646cff] no-underline hover:text-[#535bf2] dark:hover:text-[#24c8db]'
          >
            <img
              src='/vite.svg'
              className='h-[4em] p-[1em] transition-[filter] duration-[750ms] will-change-[filter] hover:drop-shadow-[0_0_2em_#747bff]'
              alt='Vite logo'
            />
          </a>
          <a
            href='https://tauri.app'
            target='_blank'
            className='font-medium text-[#646cff] no-underline hover:text-[#535bf2] dark:hover:text-[#24c8db]'
          >
            <img
              src='/tauri.svg'
              className='h-[4em] p-[1em] transition-[filter] duration-[750ms] will-change-[filter] hover:drop-shadow-[0_0_2em_#747bff]'
              alt='Tauri logo'
            />
          </a>
          <a
            href='https://react.dev'
            target='_blank'
            className='font-medium text-[#646cff] no-underline hover:text-[#535bf2] dark:hover:text-[#24c8db]'
          >
            <img
              src={reactLogo}
              className='h-[4em] p-[1em] transition-[filter] duration-[750ms] will-change-[filter] hover:drop-shadow-[0_0_2em_#61dafb]'
              alt='React logo'
            />
          </a>
        </div>

        <TodoApp store={todoStore} />

        <section className='w-full max-w-xl rounded-xl bg-white p-6 text-left shadow-[0_2px_12px_rgba(0,0,0,0.08)] dark:bg-[#0f0f0f98]'>
          <h2 className='mb-4 text-xl font-semibold'>Platform bridge check</h2>
          <form
            className='flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center'
            onSubmit={(event) => {
              event.preventDefault();
              void runGreet();
            }}
          >
            <input
              className='w-full min-w-0 flex-1 rounded-lg border border-transparent bg-[#f6f6f6] px-[1.2em] py-[0.6em] font-[inherit] text-[1em] font-medium text-[#0f0f0f] outline-none transition-[border-color] duration-[250ms] focus:border-[#396cd8] dark:bg-[#0f0f0f98] dark:text-white'
              onChange={(event) => setName(event.currentTarget.value)}
              placeholder='Enter a name...'
              aria-label='Name for greeting'
            />
            <button
              type='submit'
              className='cursor-pointer rounded-lg border border-transparent bg-white px-[1.6em] py-[0.6em] font-[inherit] text-[1em] font-medium text-[#0f0f0f] shadow-[0_2px_2px_rgba(0,0,0,0.2)] outline-none transition-[border-color] duration-[250ms] hover:border-[#396cd8] active:border-[#396cd8] active:bg-[#e8e8e8] dark:bg-[#0f0f0f98] dark:text-white dark:active:bg-[#0f0f0f69]'
            >
              Greet
            </button>
          </form>
          <p className='mb-0 mt-3 min-h-8'>{greetMsg}</p>
        </section>
      </div>
    </main>
  );
}

export default App;
