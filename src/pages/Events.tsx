import { useEffect, useState } from "react";
import { fetchEvents } from "../redux/events/eventAction";
import type { Event as EventType } from "../redux/events/eventAction";
import { useDispatch } from "react-redux";

export default function Events() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch();

  useEffect(() => {
    const getEvents = async () => {
      try {
        const actionResult = await dispatch(fetchEvents() as any);
        if (fetchEvents.fulfilled.match(actionResult)) {
          setEvents(actionResult.payload);
        } else {
          setError("Failed to fetch events");
        }
      } catch (err) {
        setError("Failed to fetch events");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getEvents();
  }, [dispatch]);

  if (loading) return <p className="p-6">Loading events...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Events</h1>

      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <ul className="space-y-2">
          {events.map((e) => (
            <li key={e.id} className="p-3 bg-gray-100 rounded">
              <h2 className="font-bold">{e.title}</h2>
              <p>{e.description}</p>
              <p className="text-sm text-gray-500">
                {e.date} | {e.location}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
