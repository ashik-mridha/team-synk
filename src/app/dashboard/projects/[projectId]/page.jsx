import { Suspense } from 'react';
import { BoardView } from '@/components/board/board-view';

export const metadata = { title: 'Board' };

export default function ProjectBoardPage() {
  return (
    <Suspense>
      <BoardView />
    </Suspense>
  );
}
