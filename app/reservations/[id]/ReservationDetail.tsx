'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import Link from 'next/link';

interface ReservationDetailProps {
  reservationId: string;
}

export default function ReservationDetail({ reservationId }: ReservationDetailProps) {
  const reservationsData = {
    '1': {
      id: 1,
      type: 'Dental Check-up',
      hospital: {
        name: 'Seoul Dental Excellence',
        address: '123 Gangnam-daero, Gangnam-gu, Seoul',
        phone: '+82-2-1234-5678',
        image: 'https://readdy.ai/api/search-image?query=Modern%20dental%20hospital%20exterior%20in%20Seoul%2C%20clean%20white%20building%2C%20professional%20medical%20facility%2C%20glass%20windows%2C%20Korean%20signage%2C%20urban%20healthcare%20center%2C%20welcoming%20entrance&width=300&height=200&seq=res-detail-hosp-1&orientation=landscape'
      },
      interpreter: {
        name: 'Sarah Kim',
        phone: '+82-10-1234-5678',
        lineId: 'sarah_medilink',
        photo: 'https://readdy.ai/api/search-image?query=Professional%20female%20medical%20interpreter%2C%20Asian%20woman%2C%20friendly%20smile%2C%20business%20casual%20attire%2C%20medical%20facility%20background%2C%20professional%20headshot%2C%20confident%20expression%2C%20healthcare%20worker&width=150&height=150&seq=res-detail-interp-1&orientation=squarish'
      },
      appointment: {
        date: '2024-02-15',
        time: '10:00 AM',
        duration: '60 minutes',
        room: 'Room 302'
      },
      status: 'Confirmed',
      notes: 'Please arrive 15 minutes early for check-in. Bring your passport and insurance documents.',
      followUpSchedule: [
        { date: '2024-02-22', time: '2:00 PM', type: 'Follow-up Check', status: 'Scheduled' },
        { date: '2024-03-15', time: '10:00 AM', type: 'Cleaning Session', status: 'Pending' }
      ]
    }
  };

  const reservation = reservationsData[reservationId as keyof typeof reservationsData];

  if (!reservation) {
    return <div>Reservation not found</div>;
  }

  const openNaverMap = () => {
    const address = encodeURIComponent(reservation.hospital.address);
    window.open(`https://map.naver.com/v5/search/${address}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <main className="pt-4">
        <div className="px-4 mb-6">
          <Link href="/reservations" className="flex items-center text-gray-600 mb-4 cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center mr-2">
              <i className="ri-arrow-left-line"></i>
            </div>
            <span className="text-sm">Back to Reservations</span>
          </Link>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-800">{reservation.type}</h1>
              <span className="bg-[#A8E6CF]/20 text-[#A8E6CF] px-3 py-1 rounded-full text-sm font-medium">
                {reservation.status}
              </span>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <div className="w-5 h-5 flex items-center justify-center mr-3">
                  <i className="ri-calendar-line text-[#A8E6CF]"></i>
                </div>
                <span className="text-gray-700">{reservation.appointment.date}</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 flex items-center justify-center mr-3">
                  <i className="ri-time-line text-[#FFD3B6]"></i>
                </div>
                <span className="text-gray-700">{reservation.appointment.time} ({reservation.appointment.duration})</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 flex items-center justify-center mr-3">
                  <i className="ri-door-line text-[#E0BBE4]"></i>
                </div>
                <span className="text-gray-700">{reservation.appointment.room}</span>
              </div>
            </div>
            <div className="bg-[#A8E6CF]/10 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Important Notes</h3>
              <p className="text-gray-700 text-sm">{reservation.notes}</p>
            </div>
          </div>
        </div>
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Hospital Information</h3>
            <div className="flex">
              <div 
                className="w-20 h-16 bg-cover bg-center rounded-xl mr-4"
                style={{ backgroundImage: `url(${reservation.hospital.image})` }}
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-1">{reservation.hospital.name}</h4>
                <p className="text-gray-600 text-sm mb-2">{reservation.hospital.address}</p>
                <p className="text-gray-600 text-sm">{reservation.hospital.phone}</p>
              </div>
            </div>
            <button 
              onClick={openNaverMap}
              className="w-full mt-4 bg-[#00C73C] text-white py-3 rounded-full font-medium cursor-pointer whitespace-nowrap"
            >
              Get Directions (Naver Map)
            </button>
          </div>
        </div>
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Interpreter Information</h3>
            <div className="flex items-center">
              <div 
                className="w-16 h-16 rounded-full bg-cover bg-center mr-4"
                style={{ backgroundImage: `url(${reservation.interpreter.photo})` }}
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-1">{reservation.interpreter.name}</h4>
                <p className="text-gray-600 text-sm mb-1">Phone: {reservation.interpreter.phone}</p>
                <p className="text-gray-600 text-sm">LINE: {reservation.interpreter.lineId}</p>
              </div>
            </div>
            <div className="flex space-x-3 mt-4">
              <div className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-full font-medium text-center">
                <div className="w-4 h-4 flex items-center justify-center mr-2 inline-block">
                  <i className="ri-phone-line"></i>
                </div>
                {reservation.interpreter.phone}
              </div>
              <div className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-full font-medium text-center">
                <div className="w-4 h-4 flex items-center justify-center mr-2 inline-block">
                  <i className="ri-chat-3-line"></i>
                </div>
                {reservation.interpreter.lineId}
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Follow-up Schedule</h3>
            <div className="space-y-3">
              {reservation.followUpSchedule.map((followUp, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">{followUp.type}</h4>
                    <p className="text-gray-600 text-xs">{followUp.date} at {followUp.time}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${followUp.status === 'Scheduled' ? 'bg-[#A8E6CF]/20 text-[#A8E6CF]' : 'bg-[#FFD3B6]/20 text-[#FFD3B6]'}`}>
                    {followUp.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-4 mb-8">
          <div className="bg-blue-50 rounded-2xl p-4 text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full mx-auto mb-3">
              <i className="ri-information-line text-blue-600 text-xl"></i>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Reservation Information</h3>
            <p className="text-gray-600 text-sm">
              This is a view-only display of your reservation details. For any changes or questions, please contact your interpreter directly.
            </p>
          </div>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}