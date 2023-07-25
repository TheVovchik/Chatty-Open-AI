import useSWR from 'swr';

export function useData(url) {
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data, error, isLoading } = useSWR(url, fetcher);
  let transformData;

  if (data) {
    transformData = Object.entries(data).map(([key, value]) => {
      return {
        id: key,
        ...value,
      }
    })
  }

  return {
    data: transformData,
    isLoading,
    error,
  }
}

export function useFeaturedEvents(url) {
  const { data, isLoading, error } = useData(url);

  let filtredData;

  if (data) {
    filtredData = data.filter((event) => event.isFeatured)
  }

  return {
    data: filtredData,
    isLoading,
    error,
  }
}

export function useAllEvents(url) {
  return useData(url);
}

export function useFilteredEvents(dateFilter, url) {
  const { data, isLoading, error } = useData(url);
  const { year, month } = dateFilter;
  let filteredEvents;

  if (data) {
    filteredEvents = data.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month - 1;
    });
  }

  return {
    data: filteredEvents,
    isLoading,
    error,
  }
}

export function useEventById(id, url) {
  const { data, isLoading, error } = useData(url);

  let singleEvent;

  if (data) {
    singleEvent = data.find((event) => event.id === id);
  }

  return {
    data: singleEvent,
    isLoading,
    error,
  }
}