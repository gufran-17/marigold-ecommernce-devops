import { Link } from 'react-router-dom';
import { Button, EmptyState } from '../../components/ui';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-page py-16">
      <EmptyState icon={SearchX} title="Page not found" message="The page you're looking for doesn't exist or has moved." action={<Link to="/"><Button>Back to home</Button></Link>} />
    </div>
  );
}
