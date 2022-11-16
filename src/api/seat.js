import * as api from './index';


const getTicketHallSeats = (mId, params) => {
  return api.doGet(`theater/ticketHall/${mId}`, params).then(res => res)
}

export default {
  getTicketHallSeats
}