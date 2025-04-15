import EventClient from './components/event-client';

export default function EventPage({ params }) {
  return <EventClient eventId={params.id} />;
}
