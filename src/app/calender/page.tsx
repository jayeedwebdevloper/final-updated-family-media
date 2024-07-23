'use client'
import EventsPage from '@/components/EventControl/Events'
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';

import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import './calender.css'
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/components/Authentication/AuthenticationParent';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CalenderPage() {
  
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDel, setIsOpenDel] = useState(false);
  const [selected, setSelected] = useState<Date>();
  const [formattedDate, setFormattedDate] = useState<string | null>(null); // State to store formatted date

  let footer = <p>Please select a day.</p>;
  if (selected) {
    footer = <p>You picked {format(selected, 'PP')}.</p>;
  }


  const [userInfo, setUserInfo] = useState<any>();

  const [loader, setLoader] = useState(true);
  useEffect(() => {
    const Logged = onAuthStateChanged(auth, (user) => {
      setUserInfo({ user });
      setLoader(false);
    })
    return () => {
      Logged();
    }
  }, []);
  const navigate = useRouter();

  const [usersData, setUsersData] = useState<any>([]);
  const [refetch, setRefetch] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/family-api/users');
        const data = await response.json();
        setUsersData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [refetch]);

  const triggerRefetch = () => {
    setRefetch(refetch + 1);
  };

  const currentUser = usersData?.find((user: any) => user.uid == userInfo?.user?.uid);

  const [events, setEvents] = useState<any[]>([]);

  const [progress, setProgress] = useState(false)

  const [required, setRequired] = useState(false)

  const addEvent = (e: any) => {
    e.preventDefault();
    if (!formattedDate) { // Check formattedDate instead of selected
      setRequired(true);
      return;
    }
    setRequired(false);
    setProgress(true);
    const form = e.target;
    const title = form.title.value;
    const color = form.color.value;
    const desc = form.desc.value;

    const newEvent = {
      userId: currentUser._id,
      displayName: currentUser.displayName,
      title,
      color,
      className: "h-[50px] flex items-center justify-center overflow-hidden capitalize",
      desc,
      date: formattedDate // Use formattedDate here
    };

    fetch("/family-api/events", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(newEvent)
    }).then(res => res.json())
      .then(data => {
        form.reset();
        toast.success("One Event Added")
        triggerRefetch();
        navigate.push("/calender");
        setRequired(false);
        setIsOpen(false);
        setProgress(false);
      })
  }

  useEffect(() => {
    fetch('/family-api/events')
      .then(res => res.json())
      .then(data => setEvents(data))
  }, [refetch])

  // Handler to set both selected date and formatted date
  const handleDateSelect = (date: Date | undefined) => {
    setSelected(date);
    if (date) {
      setFormattedDate(format(date, 'yyyy-MM-dd')); // Set formatted date
    } else {
      setFormattedDate(null);
    }
  };

  const [selectedEvent, setSelectedEvent] = useState<any>(null);


  const updateEvent = (e: any) => {
    e.preventDefault();
    if (!formattedDate) { // Check formattedDate instead of selected
      setRequired(true);
      return;
    }
    setRequired(false);
    setProgress(true);
    const form = e.target;
    const title = form.title.value;
    const color = form.color.value;
    const desc = form.desc.value;

    const eventId = selectedEvent._id;

    const newEvent = {
      userId: currentUser._id,
      displayName: currentUser.displayName,
      title,
      color,
      desc,
      date: formattedDate // Use formattedDate here
    };

    fetch("/family-api/events", {
      method: "PUT",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ newEvent, eventId })
    }).then(res => res.json())
      .then(data => {
        form.reset();
        toast.success("One Event Updated")
        triggerRefetch();
        navigate.push("/calender");
        setRequired(false);
        setIsOpenEdit(false);
        setProgress(false);
      })
  }

  const deleteEvent = (e: any) => {
    e.preventDefault();
    if (selectedEvent == null) {
      return;
    } else {
      setProgress(true);
      const eventId = selectedEvent._id;

      fetch('/family-api/events', {
        method: "DELETE",
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({ eventId })
      }).then(res => res.json())
        .then(data => {
          setSelectedEvent(null);
          setIsOpenDel(false);
          setProgress(false)
          triggerRefetch();
          e.target.reset();
          toast.success("Event Deleted")
        })
    }
  }


  return (
    loader || !currentUser ? <div className='bg-slate-200 text-lg h-screen w-full flex items-center justify-center'>Loading...</div> :
      <div className='mt-20 relative'>
        <div className="container mx-auto px-3 md:px-6">
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setIsOpen(true)} className='bg-blue-500 text-sm text-white font-semibold px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition-all duration-500 my-3'>Add Event</button>
            <button onClick={() => setIsOpenEdit(true)} className='bg-blue-500 text-sm text-white font-semibold px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition-all duration-500 my-3'>Edit An Event</button>
            <button onClick={() => setIsOpenDel(true)} className='bg-red-500 text-sm text-white font-semibold px-4 py-2 rounded-md shadow-md hover:bg-red-700 transition-all duration-500 my-3'>Delete An Event</button>
          </div>

          {/* add event */}
          <div className={`fixed h-screen w-full transition-all duration-300 bg-black/50 left-0 top-0 right-0 flex items-center justify-center  ${isOpen == false ? "invisible scale-0" : "visible scale-100 z-[100]"}`}>
            <form onSubmit={addEvent} className='bg-white w-11/12 block md:w-[450px] shadow rounded-md px-3 py-2 h-[75%] overflow-x-hidden overflow-y-scroll'>
              <div className="flex justify-between">
                <p className='font-semibold text-xl'>Add Event</p>
                <p onClick={() => setIsOpen(false)} className='text-xl cursor-pointer'>⨉</p>
              </div>

              <div className="py-1">
                <label htmlFor="title" className='block text-sm pb-1'>
                  Title
                </label>
                <input required type="text" id='title' className='w-full text-sm font-normal border-none outline-none ring-1 ring-blue-500/30 rounded-md px-3 py-2' placeholder='Event Title' name='title' />
              </div>
              <div className="py-1">
                <label htmlFor="desc" className='block text-sm pb-1'>
                  Description
                </label>
                <textarea required id='desc' className='w-full text-sm font-normal border-none outline-none ring-1 ring-blue-500/30 rounded-md px-3 py-2' placeholder='write here event description' name='desc' />
              </div>
              <div className="py-1">
                <label htmlFor="color" className='block text-sm pb-1'>
                  Select Color
                </label>
                <input required type="color" id='color' className='w-full text-sm font-normal border-none outline-none ring-1 ring-blue-500/30 rounded-md px-1' name='color' />
              </div>

              <p className='pt-1 text-sm'>Event Date</p>

              <DayPicker
                mode="single"
                selected={selected}
                onSelect={handleDateSelect} // Use the handler
                required
                footer={footer}
              />
              {required && <p className='text-red-500 text-sm py-2'>Please Select A Date</p>}

              {
                progress ? <button className='w-full bg-blue-500 flex items-center justify-center hover:bg-blue-700 transition-all duration-300 py-2 px-3 text-white rounded-md' disabled><img className="size-6 animate-spin mr-3 h-5 w-5" src="/icons/loading.svg" alt="family" /> Processing...</button> : <button className='w-full bg-blue-500 hover:bg-blue-700 transition-all duration-300 py-2 px-3 text-white rounded-md'>Add</button>
              }

            </form>
          </div>

          {/* edit event */}
          <div className={`fixed h-screen w-full transition-all duration-300 bg-black/50 left-0 top-0 right-0 flex items-center justify-center  
          ${isOpenEdit == false ? "invisible scale-0" : "visible scale-100 z-[100]"}`}>
            <form onSubmit={updateEvent} className='bg-white w-11/12 block md:w-[450px] shadow rounded-md px-3 py-2 h-[75%] overflow-x-hidden overflow-y-scroll'>
              <div className="flex justify-between">
                <p className='font-semibold text-xl'>Edit An Event</p>
                <p onClick={() => setIsOpenEdit(false)} className='text-xl cursor-pointer'>⨉</p>
              </div>

              <div className="py-1">
                <label htmlFor="select_event" className='block text-sm pb-1'>
                  Select an event
                </label>
                <select
                  className='w-full text-sm font-normal border-none capitalize outline-none ring-1 ring-blue-500/30 rounded-md px-3 py-2'
                  onChange={(e) => setSelectedEvent(JSON.parse(e.target.value))}
                  name="selectedEvent"
                  defaultValue={"Select"}
                  id="select_event"
                >
                  <option disabled>Select</option>
                  {
                    events && events.map((event: any, i: number) => (
                      <option key={i} value={JSON.stringify(event)}>
                        {event.title}
                      </option>
                    ))
                  }
                </select>
              </div>

              {
                selectedEvent != null &&
                <div>
                  <div className="py-1">
                    <label htmlFor="title" className='block text-sm pb-1'>
                      Title
                    </label>
                    <input defaultValue={selectedEvent?.title} required type="text" id='title' className='w-full text-sm font-normal border-none outline-none ring-1 ring-blue-500/30 rounded-md px-3 py-2' placeholder='Event Title' name='title' />
                  </div>
                  <div className="py-1">
                    <label htmlFor="desc" className='block text-sm pb-1'>
                      Description
                    </label>
                    <textarea defaultValue={selectedEvent?.desc} required id='desc' className='w-full text-sm font-normal border-none outline-none ring-1 ring-blue-500/30 rounded-md px-3 py-2' placeholder='write here event description' name='desc' />
                  </div>
                  <div className="py-1">
                    <label htmlFor="color" className='block text-sm pb-1'>
                      Select Color
                    </label>
                    <input defaultValue={selectedEvent?.color} required type="color" id='color' className='w-full text-sm font-normal border-none outline-none ring-1 ring-blue-500/30 rounded-md px-1' name='color' />
                  </div>

                  <p className='pt-1 text-sm'>Event Date</p>

                  <DayPicker
                    mode="single"
                    selected={selected}
                    onSelect={handleDateSelect} // Use the handler
                    required
                    footer={footer}
                  />
                  {required && <p className='text-red-500 text-sm py-2'>Please Select A Date</p>}

                  {
                    progress ? <button className='w-full bg-blue-500 flex items-center justify-center hover:bg-blue-700 transition-all duration-300 py-2 px-3 text-white rounded-md' disabled><img className="size-6 animate-spin mr-3 h-5 w-5" src="/icons/loading.svg" alt="family" /> Processing...</button> : <button className='w-full bg-blue-500 hover:bg-blue-700 transition-all duration-300 py-2 px-3 text-white rounded-md'>Save</button>
                  }
                </div>
              }

            </form>
          </div>


          {/* delete event */}
          <div className={`fixed h-screen w-full transition-all duration-300 bg-black/50 left-0 top-0 right-0 flex items-center justify-center  
          ${isOpenDel == false ? "invisible scale-0" : "visible scale-100 z-[100]"}`}>
            <form onSubmit={deleteEvent} className='bg-white w-11/12 block md:w-[450px] shadow rounded-md px-3 py-2 h-auto overflow-x-hidden overflow-y-scroll'>
              <div className="flex justify-between">
                <p className='font-semibold text-xl'>Delete An Event</p>
                <p onClick={() => setIsOpenDel(false)} className='text-xl cursor-pointer'>⨉</p>
              </div>

              <div className="py-1">
                <label htmlFor="select_event" className='block text-sm pb-1'>
                  Select an event
                </label>
                <select
                  className='w-full text-sm font-normal border-none capitalize outline-none ring-1 ring-blue-500/30 rounded-md px-3 py-2'
                  onChange={(e) => setSelectedEvent(JSON.parse(e.target.value))}
                  name="selectedEvent"
                  defaultValue={"Select"}
                  id="select_event"
                >
                  <option disabled>Select</option>
                  {
                    events && events.map((event: any, i: number) => (
                      <option key={i} value={JSON.stringify(event)}>
                        {event.title}
                      </option>
                    ))
                  }
                </select>
              </div>

              {
                selectedEvent != null &&
                <div>
                  {
                    progress ? <button className='w-full bg-blue-500 flex items-center justify-center hover:bg-blue-700 transition-all duration-300 py-2 px-3 text-white rounded-md' disabled><img className="size-6 animate-spin mr-3 h-5 w-5" src="/icons/loading.svg" alt="family" /> Processing...</button> : <button className='w-full bg-blue-500 hover:bg-blue-700 transition-all duration-300 py-2 px-3 text-white rounded-md'>Delete</button>
                  }
                </div>
              }

            </form>
          </div>


        </div>
        <EventsPage events={events} />
      </div>
  )
}
