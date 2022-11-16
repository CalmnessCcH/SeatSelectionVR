import * as api from './index';


const getShowingMovies = (params) => {
  return api.doGet(`movie/movie`, params).then(res => res)
}

const getWillShowMovies = (params) => {
  return api.doGet(`movie/comingMovie`, params).then(res => res)
}

const getCinemas = (params) => {
  return api.doGet(`theater/theater`, params).then(res => res)
}

const getMovieInfo = (mId, params) => {
  return api.doGet(`theater/movie/${mId}`, params).then(res => res)
}

const getMovieCinemaInfo = (mId, cId, params) => {
  return api.doGet(`theater/${cId}/movie/${mId}`, params).then(res => res)
}

export default {
  getShowingMovies,
  getWillShowMovies,
  getCinemas,
  getMovieInfo,
  getMovieCinemaInfo
}