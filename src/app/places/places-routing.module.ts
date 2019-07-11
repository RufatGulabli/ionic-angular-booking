import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlacesPage } from './places.page';


const router: Routes = [
    {
        path: 'tabs',
        component: PlacesPage,
        children: [
            {
                path: 'discover',
                children: [
                    {
                        path: '',
                        loadChildren: './discover/discover.module#DiscoverPageModule'
                    },
                    {
                        path: ':placeId',
                        loadChildren: './discover/place-details/place-details.module#PlaceDetailsPageModule'
                    }
                ]
            },
            {
                path: 'offers',
                children: [
                    {
                        path: '',
                        loadChildren: './offers/offers.module#OffersPageModule'
                    },
                    {
                        path: 'new',
                        loadChildren: './offers/new-offer/new-offer.module#NewOfferPageModule'
                    },
                    {
                        path: 'edit/:offerId',
                        loadChildren: './offers/edit-offer/edit-offer.module#EditOfferPageModule'
                    }
                ]
            },
            {
                path: '',
                redirectTo: '/places/tabs/discover',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        redirectTo: '/places/tabs/discover',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forChild(router)],
    exports: [RouterModule]
})
export class PlacesRoutingModule { }
