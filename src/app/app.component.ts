import { HttpClient} from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { tileLayer, latLng, MapOptions, marker, Layer, LatLng, icon } from 'leaflet';

interface Marker {
  id: number
  // Широта
  latitude: number
  // Долгота
  longitude: number
  // Имя
  name: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private changeDetector: ChangeDetectorRef
  ){ }

  markers: Marker[] = [];
  layers: Layer[] = [];
  leafletCenter: LatLng = latLng(46.11, 9.23);
  leafletZoom: number = 5;
  options: MapOptions = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: this.leafletZoom,
    center: this.leafletCenter,
    markerZoomAnimation: true
  };

  selectedMarkerRef: Marker = { } as Marker;
  searchStr: string = "";
  viewedMarkers: Marker[] = [];

  ngOnInit(): void {
    this.loadMarkers();
  }

  loadMarkers(){
    this.http
      .get<Marker[]>("https://raw.githubusercontent.com/waliot/test-tasks/master/assets/data/frontend-1-dataset.json")
      .subscribe(markers => {
        if (markers?.length > 0){
          this.markers = markers;
          this.viewedMarkers = this.filterMarkers(this.markers);
        }
        else{
          this.markers = [];
        }
        this.layers = this.getMarkers();
      });
  }

  getMarkers(): Layer[]{
    this.layers?.forEach(layer => layer.clearAllEventListeners());
    let layers = [];
    if (this.viewedMarkers?.length > 0){
      layers
      .push(
        ...this.viewedMarkers.map<Layer>(
          currentMarker => marker([currentMarker.latitude, currentMarker.longitude], { title: currentMarker.name, icon: icon({ iconUrl: this.selectedMarkerRef === currentMarker ? "assets/markers/marker-chosen.png" : "assets/markers/marker.png", iconSize: [ 41, 41 ] }) })
            .addEventListener("click", () => {
              this.selectMarker(currentMarker);
            })
        )
      );
    };
    return layers;
  }

  selectMarker(marker: Marker){
    this.leafletCenter = latLng(marker.latitude, marker.longitude);
    this.leafletZoom = 10;
    this.selectedMarkerRef = marker;
    this.layers = this.getMarkers();
    this.changeDetector.detectChanges();
  }

  searchHandler(){
    this.viewedMarkers = this.filterMarkers(this.markers);
    this.layers = this.getMarkers();
  }

  filterMarkers(markers: Marker[]): Marker[]{
    return markers
      .filter(
        marker => marker
          .name
          .toLowerCase()
          .includes(this.searchStr.toLowerCase())
      );
  }

}
