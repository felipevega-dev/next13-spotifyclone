import getSongs from '@/actions/getSongs';
import ListItem from '@/components/ListItem';
import Image from 'next/image';
import PageContent from './components/PageContent';
import Header from '@/components/Header';

export const revalidate = 0;


export default async function Home() {
  const songs = await getSongs();

  return (
    <div className='
      bg-neutral-900
      rounder-lg
      h-full
      w-full
      overflow-hidden
      overflow-y-auto
    '>
      <Header>
        <div className='mb-2'>
          <h1 
            className='
              text-white
              text-3xl
              font-semibold
            
            '>
              Bienvenido!
          </h1>
          <div
           className='
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-3
            2xl:grid-cols-4
            gap-3
            mt-4
           '
          >
            <ListItem 
              image="/images/liked.png"
              name="Tus Me gusta!"
              href='liked'
            />
          </div>
        </div>
      </Header>
      <div className='mt-2 mb-7 px-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-white text-2x1 font-semibold'>
            Música añadida recientemente
          </h1>
        </div>
        <PageContent songs={songs} /> 
      </div>
    </div>
  )
}
