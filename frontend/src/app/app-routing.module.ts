import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './auth/login/login.component';
import {ForgotPasswordComponent} from './auth/forgot-password/forgot-password.component';
import {GuestLoginComponent} from './auth/guest-login/guest-login.component';
import {RegisterComponent} from './auth/register/register.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {AuthguardService} from './services/authguard.service';
import {GuestguardService} from './services/guestguard.service';
import {DiamondsComponent} from './diamonds/diamonds.component';
import {JewelryComponent} from './jewelry/jewelry.component';
import {TradeCenterComponent} from './trade-center/trade-center.component';
import {BuyRequestsComponent} from './buy-requests/buy-requests.component';
import {ReportCenterComponent} from './report-center/report-center.component';
import {PeopleComponent} from './people/people.component';
import {NewsComponent} from './news/news.component';
import {SupportComponent} from './support/support.component';
import {InstatntInventoryComponent} from './instatnt-inventory/instatnt-inventory.component';
import {AddOnsComponent} from './add-ons/add-ons.component';
import {NewsDetailsComponent} from './news-details/news-details.component';
import {SearchDiamondsComponent} from './search-diamonds/search-diamonds.component';
import {AdminLoginComponent} from './auth/admin-login/admin-login.component';
import {AdminGuestGuardService} from './services/admin-guest-guard.service';
import {AdminForgotPasswordComponent} from './auth/admin-forgot-password/admin-forgot-password.component';
import {AdminDashboardComponent} from './admin/admin-dashboard/admin-dashboard.component';
import {AdminAuthguardService} from './services/admin-authguard.service';
import {OrdersComponent} from './orders/orders.component';
import {AdminDiamondsComponent} from './admin/admin-diamonds/admin-diamonds.component';
import {AdminOrdersComponent} from './admin/admin-orders/admin-orders.component';
import {AdminCustomersComponent} from './admin/admin-customers/admin-customers.component';
import {AdminAnyalyticsComponent} from './admin/admin-anyalytics/admin-anyalytics.component';
import {AdminSellersComponent} from './admin/admin-sellers/admin-sellers.component';
import {AdminProfileComponent} from './admin/admin-profile/admin-profile.component';
import {AdminEditProfileComponent} from './admin/admin-edit-profile/admin-edit-profile.component';
import {AdminAddSellerComponent} from './admin/admin-add-seller/admin-add-seller.component';
import {AdminVerifyAccountComponent} from './admin/admin-verify-account/admin-verify-account.component';
import {AdminAddCustomerComponent} from './admin/admin-add-customer/admin-add-customer.component';
import {AdminAddDiamondsComponent} from './admin/admin-add-diamonds/admin-add-diamonds.component';
import {ProfileComponent} from './profile/profile.component';
import {EditProfileComponent} from './edit-profile/edit-profile.component';
import {HomeComponent} from './home/home.component';
import {CompanyProfileComponent} from './company-profile/company-profile.component';
import {BlogComponent} from './blog/blog.component';
import {ContactUsComponent} from './contact-us/contact-us.component';
import {WhyComponent} from './why/why.component';
import {TestimonialsComponent} from './testimonials/testimonials.component';
import {PolicyComponent} from './policy/policy.component';
import {CsrComponent} from './csr/csr.component';
import {AchievementsComponent} from './achievements/achievements.component';
import {K4cComponent} from './k4c/k4c.component';
import {KGradingComponent} from './k-grading/k-grading.component';
import {TermsConditionComponent} from './terms-condition/terms-condition.component';
import {FaqComponent} from './faq/faq.component';
import {ChatListComponent} from './chat-list/chat-list.component';
import {AdminBlogComponent} from './admin/admin-blog/admin-blog.component';
import {AdminAddBlogComponent} from './admin/admin-add-blog/admin-add-blog.component';
import {BlogDetailsComponent} from './blog-details/blog-details.component';
import {AdminChatListComponent} from './admin/admin-chat-list/admin-chat-list.component';
import {AdminTestimonialsComponent} from './admin/admin-testimonials/admin-testimonials.component';
import {AdminAddTestimonialsComponent} from './admin/admin-add-testimonials/admin-add-testimonials.component';
import {AdminMilestonesComponent} from './admin/admin-milestones/admin-milestones.component';
import {AdminAddMilestonesComponent} from './admin/admin-add-milestones/admin-add-milestones.component';
import {AdminBrandsComponent} from './admin/admin-brands/admin-brands.component';
import {AdminAddBrandsComponent} from './admin/admin-add-brands/admin-add-brands.component';
import {AdminHomeSettingsComponent} from './admin/admin-home-settings/admin-home-settings.component';
import {AdminDiamondsDetailsComponent} from './admin/admin-diamonds-details/admin-diamonds-details.component';
import {DiamondsDetailsComponent} from './diamonds-details/diamonds-details.component';
import {BuyRequestsDetailsComponent} from './buy-requests-details/buy-requests-details.component';
import {CartComponent} from './cart/cart.component';
import {AdminEditOrderComponent} from './admin/admin-edit-order/admin-edit-order.component';
import {OrderDetailsComponent} from './order-details/order-details.component';
import {BrandEntityComponent} from './brand-entity/brand-entity.component';
import {AdminEmailTemplatesComponent} from './admin/admin-email-templates/admin-email-templates.component';
import {AdminAddEmailTemplateComponent} from './admin/admin-add-email-template/admin-add-email-template.component';
import {AdminRequestsComponent} from './admin/admin-requests/admin-requests.component';
import {AdminViewRequestsComponent} from './admin/admin-view-requests/admin-view-requests.component';
import {AdminUploadReportsComponent} from './admin/admin-upload-reports/admin-upload-reports.component';
import {AdminAddUploadReportsComponent} from './admin/admin-add-upload-reports/admin-add-upload-reports.component';
import {AdminUploadReportDetailsComponent} from './admin/admin-upload-report-details/admin-upload-report-details.component';
import {AdminCartListComponent} from './admin/admin-cart-list/admin-cart-list.component';
import {SitemapComponent} from './sitemap/sitemap.component';
import {AdminAnalyticsReportComponent} from './admin/admin-analytics-report/admin-analytics-report.component';
import {AdminAnalyticsDashboardsComponent} from './admin/admin-analytics-dashboards/admin-analytics-dashboards.component';
import {AdminAnalyticsLiveviewComponent} from './admin/admin-analytics-liveview/admin-analytics-liveview.component';
import {NewProductsComponent} from './new-products/new-products.component';
import {WatchlistComponent} from './watchlist/watchlist.component';
// import { OurStoryComponent } from './our-story/our-story.component';
// import {GradingComponent} from './grading/grading.component';
// import {FoundersMessageComponent} from './founders-message/founders-message.component';
// import {OurTeamComponent} from './our-team/our-team.component';
import {CommonFrontLayoutComponent} from './common-front-layout/common-front-layout.component';



const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'achievements', component: AchievementsComponent, canActivate: [GuestguardService] },
  { path: 'add-ons', component: AddOnsComponent, canActivate: [AuthguardService]},
  { path: 'buy-requests', component: BuyRequestsComponent, canActivate: [AuthguardService]},
  { path: 'buy-requests/view-requests/:buy_requests_id', component: BuyRequestsDetailsComponent, canActivate: [AuthguardService]},
  { path: 'blog', component: BlogComponent, canActivate: [GuestguardService] },
  { path: 'blog-details/:blogId', component: BlogDetailsComponent, canActivate: [GuestguardService] },
  { path: 'brands-entity', component: BrandEntityComponent, canActivate: [GuestguardService] },
  { path: 'home', component: HomeComponent, canActivate: [GuestguardService] },
  { path: 'company-profile', component: CompanyProfileComponent, canActivate: [GuestguardService] },
  { path: 'contact-us', component: ContactUsComponent},
  { path: 'customers-testimonials', component: TestimonialsComponent, canActivate: [GuestguardService] },
  { path: 'csr', component: CsrComponent, canActivate: [GuestguardService] },
  { path: 'cart', component: CartComponent, canActivate: [AuthguardService] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthguardService]},
  { path: 'diamonds', component: DiamondsComponent, canActivate: [AuthguardService]},     // , data: {shouldDetach: true}
  { path: 'diamonds/view-diamonds/:diamond_id', component: DiamondsDetailsComponent, canActivate: [AuthguardService]},
  { path: 'edit-profile', component: EditProfileComponent, canActivate: [AuthguardService] },
  { path: 'faq', component: FaqComponent},    /*, canActivate: [GuestguardService]*/
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [GuestguardService] },
  { path: 'instant-inventory', component: InstatntInventoryComponent, canActivate: [AuthguardService]},
  { path: 'jewelry', component: JewelryComponent, canActivate: [AuthguardService]},
  { path: 'k4c', component: K4cComponent, canActivate: [GuestguardService] },
  { path: 'k-grading', component: KGradingComponent, canActivate: [GuestguardService] },
  { path: 'login', component: LoginComponent, canActivate: [GuestguardService] },
  { path: 'login-as-guest', component: GuestLoginComponent, canActivate: [GuestguardService] },
  { path: 'message', component: ChatListComponent, canActivate: [AuthguardService] },
  { path: 'news', component: NewsComponent, canActivate: [AuthguardService]},
  { path: 'new-products', component: NewProductsComponent, canActivate: [AuthguardService]},
  { path: 'news-details/:articleID', component: NewsDetailsComponent, canActivate: [AuthguardService]},
  { path: 'orders', component: OrdersComponent, canActivate: [AuthguardService]},
  { path: 'orders/order-details/:order_id', component: OrderDetailsComponent, canActivate: [AuthguardService]},
  { path: 'policy', component: PolicyComponent, canActivate: [GuestguardService] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthguardService] },
  { path: 'people', component: PeopleComponent, canActivate: [AuthguardService]},
  { path: 'report-center', component: ReportCenterComponent, canActivate: [AuthguardService]},
  { path: 'register', component: RegisterComponent, canActivate: [GuestguardService] },
  { path: 'support', component: SupportComponent, canActivate: [AuthguardService]},
  { path: 'sitemap', component: SitemapComponent, canActivate: [GuestguardService]},
  { path: 'search-diamonds', component: SearchDiamondsComponent, canActivate: [AuthguardService]},
  { path: 'terms-and-condition', component: TermsConditionComponent, canActivate: [GuestguardService] },
  { path: 'trade-center', component: TradeCenterComponent, canActivate: [AuthguardService]},
  { path: 'why-kukadia', component: WhyComponent, canActivate: [GuestguardService] },
  { path: 'watchlist', component: WatchlistComponent, canActivate: [AuthguardService] },
  // { path: 'our-story', component: OurStoryComponent, canActivate: [GuestguardService] },
  // { path: 'grading', component: GradingComponent, canActivate: [GuestguardService] },
  // { path: 'founders-message', component: FoundersMessageComponent, canActivate: [GuestguardService] },
  // { path: 'our-team', component: OurTeamComponent, canActivate: [GuestguardService] },
  {
    path: '', component: CommonFrontLayoutComponent,
    loadChildren: () => import('src/app/lazyModules/lazy/lazy.module')
      .then(m => m.LazyModule)
      .catch((err) => console.error(err)), canActivate: [GuestguardService]
  },
  // { path: 'message/:id', component: ChatListComponent, canActivate: [AuthguardService] },

  { path: 'admin', component: AdminLoginComponent, canActivate: [AdminGuestGuardService] },
  { path: 'admin/login', component: AdminLoginComponent, canActivate: [AdminGuestGuardService] },
  { path: 'admin/forgot-password', component: AdminForgotPasswordComponent, canActivate: [AdminGuestGuardService] },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/diamonds', component: AdminDiamondsComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/diamonds/add-diamonds', component: AdminAddDiamondsComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/diamonds/edit-diamonds/:diamond_id', component: AdminAddDiamondsComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/diamonds/view-diamonds/:diamond_id', component: AdminDiamondsDetailsComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/orders', component: AdminOrdersComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/orders/order-details/:order_id', component: AdminEditOrderComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/customers/cart-list/:cartId', component: AdminCartListComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/customers', component: AdminCustomersComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/customers/add-customer', component: AdminAddCustomerComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/customers/edit-customer/:userId', component: AdminAddCustomerComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/analytics', component: AdminAnyalyticsComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/subadmin', component: AdminSellersComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/subadmin/add-subadmin', component: AdminAddSellerComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/subadmin/edit-subadmin/:adminId', component: AdminAddSellerComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/blog', component: AdminBlogComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/blog/add-blog', component: AdminAddBlogComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/blog/edit-blog/:blogId', component: AdminAddBlogComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/profile', component: AdminProfileComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/edit-profile', component: AdminEditProfileComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/verify-account/:Token', component: AdminVerifyAccountComponent, canActivate: [AdminGuestGuardService] },
  { path: 'admin/message', component: AdminChatListComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/message/:id', component: AdminChatListComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/testimonials', component: AdminTestimonialsComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/testimonials/add-testimonials', component: AdminAddTestimonialsComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/testimonials/edit-testimonials/:testimonialsId', component: AdminAddTestimonialsComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/milestones', component: AdminMilestonesComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/milestones/add-milestones', component: AdminAddMilestonesComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/milestones/edit-milestones/:milestonesId', component: AdminAddMilestonesComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/brands', component: AdminBrandsComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/brands/add-brands', component: AdminAddBrandsComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/brands/edit-brands/:brandId', component: AdminAddBrandsComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/homepage-settings', component: AdminHomeSettingsComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/buy-requests', component: AdminRequestsComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/buy-requests/view-requests/:buy_requests_id', component: AdminViewRequestsComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/email-templates', component: AdminEmailTemplatesComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/email-templates/add-template', component: AdminAddEmailTemplateComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/email-templates/edit-template/:templateId', component: AdminAddEmailTemplateComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/upload-reports', component: AdminUploadReportsComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/upload-reports/add-reports', component: AdminAddUploadReportsComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/analytics/overview-dashboard', component: AdminAnalyticsDashboardsComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/analytics/report', component: AdminAnalyticsReportComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/analytics/live-view', component: AdminAnalyticsLiveviewComponent, canActivate: [AdminAuthguardService] },
  { path: 'admin/upload-reports/report-details/:folderName', component: AdminUploadReportDetailsComponent, canActivate: [AdminAuthguardService] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
