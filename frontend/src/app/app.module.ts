import { BrowserModule } from '@angular/platform-browser';
import { NgParticlesModule } from 'ng-particles';
import { DEFAULT_CURRENCY_CODE, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { RouteReuseStrategy } from '@angular/router';
import { CustomRouteReuseStrategy } from './services/custom-route-reuse-strategy';
import { ToastrModule } from 'ngx-toastr';
import { ClipboardModule as ClipModule } from '@angular/cdk/clipboard';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoginComponent } from './auth/login/login.component';
import { GuestLoginComponent } from './auth/guest-login/guest-login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DiamondsComponent } from './diamonds/diamonds.component';
import { JewelryComponent } from './jewelry/jewelry.component';
import { TradeCenterComponent } from './trade-center/trade-center.component';
import { BuyRequestsComponent } from './buy-requests/buy-requests.component';
import { ReportCenterComponent } from './report-center/report-center.component';
import { PeopleComponent } from './people/people.component';
import { NewsComponent } from './news/news.component';
import { SupportComponent } from './support/support.component';
import { InstatntInventoryComponent } from './instatnt-inventory/instatnt-inventory.component';
import { AddOnsComponent } from './add-ons/add-ons.component';
import { NewsDetailsComponent } from './news-details/news-details.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { NgSelect2Module } from 'ng-select2';
import { SearchDiamondsComponent } from './search-diamonds/search-diamonds.component';
import { DataTablesModule } from 'angular-datatables';
import { AdminLoginComponent } from './auth/admin-login/admin-login.component';
import { AdminForgotPasswordComponent } from './auth/admin-forgot-password/admin-forgot-password.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminHeaderComponent } from './admin/admin-header/admin-header.component';
import { AdminSidebarComponent } from './admin/admin-sidebar/admin-sidebar.component';
import { OrdersComponent } from './orders/orders.component';
import { AdminDiamondsComponent } from './admin/admin-diamonds/admin-diamonds.component';
import { AdminOrdersComponent } from './admin/admin-orders/admin-orders.component';
import { AdminCustomersComponent } from './admin/admin-customers/admin-customers.component';
import { AdminAnyalyticsComponent } from './admin/admin-anyalytics/admin-anyalytics.component';
import { AdminSellersComponent } from './admin/admin-sellers/admin-sellers.component';
import { AdminProfileComponent } from './admin/admin-profile/admin-profile.component';
import { AdminEditProfileComponent } from './admin/admin-edit-profile/admin-edit-profile.component';
import { AdminAddSellerComponent } from './admin/admin-add-seller/admin-add-seller.component';
import { AdminVerifyAccountComponent } from './admin/admin-verify-account/admin-verify-account.component';
import { AdminAddCustomerComponent } from './admin/admin-add-customer/admin-add-customer.component';
import { ClipboardModule } from 'ngx-clipboard';
import { AdminAddDiamondsComponent } from './admin/admin-add-diamonds/admin-add-diamonds.component';
import { ProfileComponent } from './profile/profile.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { HomeComponent } from './home/home.component';
import { FrontHeaderComponent } from './front-header/front-header.component';
import { FrontFooterComponent } from './front-footer/front-footer.component';
import { CompanyProfileComponent } from './company-profile/company-profile.component';
import { BlogComponent } from './blog/blog.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { WhyComponent } from './why/why.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { PolicyComponent } from './policy/policy.component';
import { CsrComponent } from './csr/csr.component';
import { AchievementsComponent } from './achievements/achievements.component';
import { K4cComponent } from './k4c/k4c.component';
import { KGradingComponent } from './k-grading/k-grading.component';
import { FaqComponent } from './faq/faq.component';
import { TermsConditionComponent } from './terms-condition/terms-condition.component';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatService } from './chat.service';
import { AdminBlogComponent } from './admin/admin-blog/admin-blog.component';
import { AdminAddBlogComponent } from './admin/admin-add-blog/admin-add-blog.component';
import { BlogDetailsComponent } from './blog-details/blog-details.component';
import { AdminChatListComponent } from './admin/admin-chat-list/admin-chat-list.component';
import { AdminDiamondsDetailsComponent } from './admin/admin-diamonds-details/admin-diamonds-details.component';
import { SanitizeUrlPipe } from './pipe/sanitize-url.pipe';
import { AdminTestimonialsComponent } from './admin/admin-testimonials/admin-testimonials.component';
import { AdminAddTestimonialsComponent } from './admin/admin-add-testimonials/admin-add-testimonials.component';
import { AdminHomeSettingsComponent } from './admin/admin-home-settings/admin-home-settings.component';
import { AdminMilestonesComponent } from './admin/admin-milestones/admin-milestones.component';
import { AdminAddMilestonesComponent } from './admin/admin-add-milestones/admin-add-milestones.component';
import { AdminBrandsComponent } from './admin/admin-brands/admin-brands.component';
import { AdminAddBrandsComponent } from './admin/admin-add-brands/admin-add-brands.component';
import { DiamondsDetailsComponent } from './diamonds-details/diamonds-details.component';
import { BuyRequestsDetailsComponent } from './buy-requests-details/buy-requests-details.component';
import { CartComponent } from './cart/cart.component';
import { AdminEditOrderComponent } from './admin/admin-edit-order/admin-edit-order.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { BrandEntityComponent } from './brand-entity/brand-entity.component';
import { AdminEmailTemplatesComponent } from './admin/admin-email-templates/admin-email-templates.component';
import { AdminAddEmailTemplateComponent } from './admin/admin-add-email-template/admin-add-email-template.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AdminRequestsComponent } from './admin/admin-requests/admin-requests.component';
import { AdminViewRequestsComponent } from './admin/admin-view-requests/admin-view-requests.component';
import { CKEditorModule } from 'ckeditor4-angular';
import { AdminUploadReportsComponent } from './admin/admin-upload-reports/admin-upload-reports.component';
import { AdminAddUploadReportsComponent } from './admin/admin-add-upload-reports/admin-add-upload-reports.component';
import { AdminUploadReportDetailsComponent } from './admin/admin-upload-report-details/admin-upload-report-details.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { AdminCartListComponent } from './admin/admin-cart-list/admin-cart-list.component';
import { SitemapComponent } from './sitemap/sitemap.component';
import { AdminAnalyticsReportComponent } from './admin/admin-analytics-report/admin-analytics-report.component';
import { AdminAnalyticsDashboardsComponent } from './admin/admin-analytics-dashboards/admin-analytics-dashboards.component';
import { AdminAnalyticsLiveviewComponent } from './admin/admin-analytics-liveview/admin-analytics-liveview.component';
import { TooltipModule } from 'ng2-tooltip-directive';
import { NewProductsComponent } from './new-products/new-products.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
// import { OurStoryComponent } from './our-story/our-story.component';
// import { GradingComponent } from './grading/grading.component';
// import { FoundersMessageComponent } from './founders-message/founders-message.component';
// import { OurTeamComponent } from './our-team/our-team.component';
import { CommonFrontLayoutComponent } from './common-front-layout/common-front-layout.component'
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [
    AppComponent,
    SanitizeUrlPipe,
    LoginComponent,
    GuestLoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    DashboardComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    DiamondsComponent,
    JewelryComponent,
    TradeCenterComponent,
    BuyRequestsComponent,
    ReportCenterComponent,
    PeopleComponent,
    NewsComponent,
    SupportComponent,
    InstatntInventoryComponent,
    AddOnsComponent,
    NewsDetailsComponent,
    SearchDiamondsComponent,
    AdminLoginComponent,
    AdminForgotPasswordComponent,
    AdminDashboardComponent,
    AdminHeaderComponent,
    AdminSidebarComponent,
    OrdersComponent,
    AdminDiamondsComponent,
    AdminOrdersComponent,
    AdminCustomersComponent,
    AdminAnyalyticsComponent,
    AdminSellersComponent,
    AdminProfileComponent,
    AdminEditProfileComponent,
    AdminAddSellerComponent,
    AdminVerifyAccountComponent,
    AdminAddCustomerComponent,
    AdminAddDiamondsComponent,
    ProfileComponent,
    EditProfileComponent,
    HomeComponent,
    FrontHeaderComponent,
    FrontFooterComponent,
    CompanyProfileComponent,
    BlogComponent,
    ContactUsComponent,
    WhyComponent,
    TestimonialsComponent,
    PolicyComponent,
    CsrComponent,
    AchievementsComponent,
    K4cComponent,
    KGradingComponent,
    FaqComponent,
    TermsConditionComponent,
    ChatListComponent,
    AdminBlogComponent,
    AdminAddBlogComponent,
    BlogDetailsComponent,
    AdminChatListComponent,
    AdminDiamondsDetailsComponent,
    AdminTestimonialsComponent,
    AdminAddTestimonialsComponent,
    AdminHomeSettingsComponent,
    AdminMilestonesComponent,
    AdminAddMilestonesComponent,
    AdminBrandsComponent,
    AdminAddBrandsComponent,
    DiamondsDetailsComponent,
    BuyRequestsDetailsComponent,
    CartComponent,
    AdminEditOrderComponent,
    OrderDetailsComponent,
    BrandEntityComponent,
    AdminEmailTemplatesComponent,
    AdminAddEmailTemplateComponent,
    AdminRequestsComponent,
    AdminViewRequestsComponent,
    AdminUploadReportsComponent,
    AdminAddUploadReportsComponent,
    AdminUploadReportDetailsComponent,
    AdminCartListComponent,
    SitemapComponent,
    AdminAnalyticsReportComponent,
    AdminAnalyticsDashboardsComponent,
    AdminAnalyticsLiveviewComponent,
    NewProductsComponent,
    WatchlistComponent,
    CommonFrontLayoutComponent,
    // GradingComponent,
    // OurStoryComponent
    // FoundersMessageComponent,
    // OurTeamComponent,
  ],
  imports: [
    TooltipModule,
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    BrowserAnimationsModule,
    DataTablesModule,
    ReactiveFormsModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatRadioModule,
    MatFormFieldModule,
    SlickCarouselModule,
    NgSelect2Module,
    ClipboardModule,
    ClipModule,
    NgParticlesModule,
    NgApexchartsModule,
    CKEditorModule,
    ImageCropperModule,
    NgxSpinnerModule,
    ToastrModule.forRoot()
  ],
  providers: [
    ChatService,
    {
      provide: RouteReuseStrategy,
      useClass: CustomRouteReuseStrategy
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
