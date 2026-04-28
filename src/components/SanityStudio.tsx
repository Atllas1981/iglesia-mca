import { Studio } from 'sanity';
import config from '../sanity/sanity.config';

export default function SanityStudio() {
  return (
    <div className="sanity-studio" style={{ height: '100vh', margin: 0, padding: 0 }}>
      <Studio config={config} />
    </div>
  );
}
