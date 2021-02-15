import React, { useEffect, useState } from 'react';
import './App.css';
import axios from "axios";
import { stringify } from "querystring";
import { Carousel } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const baseUri: string = process.env.REACT_APP_API_URL as string;

function useGetPhotos() {
  const [photos, setPhotos] = useState([]);
  useEffect(() => {
    (async function fetchPhotos() {
      const { data: {photos: newPhotos} } = await axios.get(`${baseUri}get-photos`);
      setPhotos(newPhotos);
    })();
  }, [])

  return photos;
}

function App() {
  const photos: any[] = useGetPhotos();
  return (
    <div className="App bg-secondary min-vh-100">
      <Carousel>
        {photos.map(photo =>(
          <Carousel.Item className="Item min-vh-100" interval={1000}>
            <img className="h-100" src={photo.url} alt={photo.filename}/>
            <Carousel.Caption>
              <h4 style={{color: 'black'}}>{photo.filename}</h4>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}

export default App;
