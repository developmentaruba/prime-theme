<?php
defined( 'ABSPATH' ) || exit;

$profile      = sp_get_profile();
$tabs         = sp_get_tabs();
$socials      = $profile['socials'] ?? [];
$social_icons = sp_social_icons();

$modal_title    = esc_html( 'Join ' . $profile['name'] . ' + Friends' );
$modal_subtitle = esc_html( $profile['modal_subtitle'] ?? 'Sign up for exclusive access to new mixes, events + more' );
$modal_btn      = esc_html( $profile['modal_btn_text'] ?? 'Sign Up' );

get_header();
?>
<div class="sp-page" id="sp-page">

	<!-- =================================================================
	     PROFILE HEADER
	     ================================================================= -->
	<header class="sp-header">
		<div class="sp-header__inner">

			<?php if ( ! empty( $profile['avatar'] ) ) : ?>
				<div class="sp-avatar">
					<img src="<?php echo esc_url( $profile['avatar'] ); ?>" alt="<?php echo esc_attr( $profile['name'] ); ?>" id="sp-avatar-img">
				</div>
			<?php else : ?>
				<div class="sp-avatar sp-avatar--placeholder" id="sp-avatar-wrap">
					<span id="sp-avatar-initials"><?php echo esc_html( mb_substr( $profile['name'], 0, 1 ) ); ?></span>
				</div>
			<?php endif; ?>

			<h1 class="sp-name" id="sp-name"><?php echo esc_html( $profile['name'] ); ?></h1>
			<p class="sp-subtitle" id="sp-subtitle"><?php echo wp_kses_post( $profile['subtitle'] ); ?></p>

			<?php if ( ! empty( $profile['bio'] ) ) : ?>
				<p class="sp-bio" id="sp-bio"><?php echo wp_kses_post( $profile['bio'] ); ?></p>
			<?php endif; ?>

			<?php if ( ! empty( $profile['location'] ) ) : ?>
				<p class="sp-location" id="sp-location">
					<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="14" height="14"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
					<?php echo esc_html( $profile['location'] ); ?>
				</p>
			<?php endif; ?>

			<!-- Social Icons -->
			<?php
			$active_socials = array_filter( $socials, fn( $u ) => ! empty( $u ) );
			$custom_links   = array_filter( $profile['custom_links'] ?? [], fn( $l ) => ! empty( $l['url'] ) );
			?>
			<?php if ( $active_socials || $custom_links ) : ?>
				<nav class="sp-socials" aria-label="Social links" id="sp-socials">
					<?php foreach ( $active_socials as $platform => $url ) : ?>
						<?php if ( isset( $social_icons[ $platform ] ) ) : ?>
							<a href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener noreferrer" class="sp-social-icon" aria-label="<?php echo esc_attr( $social_icons[ $platform ]['label'] ); ?>">
								<?php echo $social_icons[ $platform ]['svg']; // phpcs:ignore ?>
							</a>
						<?php endif; ?>
					<?php endforeach; ?>
					<?php foreach ( $custom_links as $link ) : ?>
						<a href="<?php echo esc_url( $link['url'] ); ?>" target="_blank" rel="noopener noreferrer" class="sp-social-icon sp-social-icon--custom" aria-label="<?php echo esc_attr( $link['label'] ?? 'Link' ); ?>">
							<?php if ( ! empty( $link['icon_url'] ) ) : ?>
								<img src="<?php echo esc_url( $link['icon_url'] ); ?>" alt="" width="18" height="18">
							<?php else : ?>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
							<?php endif; ?>
						</a>
					<?php endforeach; ?>
				</nav>
			<?php endif; ?>

			<!-- Email Collection CTA -->
			<?php if ( ! empty( $profile['cta_text'] ) ) : ?>
				<button class="sp-cta" id="sp-cta-btn" aria-haspopup="dialog">
					<?php echo esc_html( $profile['cta_text'] ); ?>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
				</button>
			<?php endif; ?>

		</div>
	</header>

	<!-- =================================================================
	     EMAIL COLLECTION MODAL
	     ================================================================= -->
	<div class="sp-modal-overlay" id="sp-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="sp-modal-title" hidden>
		<div class="sp-modal" id="sp-modal">
			<button class="sp-modal__close" id="sp-modal-close" aria-label="Close">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
			</button>

			<h2 class="sp-modal__title" id="sp-modal-title"><?php echo $modal_title; ?></h2>
			<p class="sp-modal__subtitle"><?php echo $modal_subtitle; ?></p>

			<form class="sp-modal__form" id="sp-modal-form" novalidate>
				<div class="sp-modal__field">
					<input type="email" name="sp_email" id="sp-email-input" placeholder="Email address" autocomplete="email" required>
				</div>

				<!-- Phone: country code picker + number -->
				<div class="sp-modal__field">
					<div class="sp-phone-box" id="sp-phone-row">

						<div role="button" tabindex="0" class="sp-dial-trigger" id="sp-dial-btn" aria-haspopup="listbox" aria-expanded="false" aria-label="Country code">
							<span class="sp-dial-flag" id="sp-dial-flag">🇦🇼</span>
							<span class="sp-dial-num"  id="sp-dial-num">+297</span>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11" aria-hidden="true" class="sp-dial-chevron"><polyline points="6 9 12 15 18 9"/></svg>
						</div>

						<input type="hidden" id="sp-dial-code" name="sp_dial_code" value="+297">
						<span class="sp-phone-sep" aria-hidden="true"></span>

						<input
							type="tel"
							name="sp_phone_number"
							id="sp-phone-number"
							class="sp-phone-number"
							placeholder="Phone number (optional)"
							autocomplete="tel-national"
						>

						<div class="sp-dial-dropdown" id="sp-dial-dropdown" role="listbox" aria-label="Select country code" style="display:none">
							<div class="sp-dial-search-wrap">
								<input type="text" class="sp-dial-search" id="sp-dial-search" placeholder="Search country…" autocomplete="off">
							</div>
							<ul class="sp-dial-list" id="sp-dial-list">
								<?php
								$dial_codes = [
									// — Caribbean (top of list) —
									['+297', '🇦🇼', 'Aruba'],
									['+599', '🇨🇼', 'Curaçao'],
									['+599', '🇧🇶', 'Bonaire'],
									['+599', '🏳️', 'Sint Eustatius'],
									['+599', '🏳️', 'Saba'],
									['+1721','🇸🇽', 'Sint Maarten'],
									['+1787','🇵🇷', 'Puerto Rico'],
									['+1809','🇩🇴', 'Dominican Republic'],
									['+1876','🇯🇲', 'Jamaica'],
									['+1868','🇹🇹', 'Trinidad & Tobago'],
									['+1246','🇧🇧', 'Barbados'],
									['+1473','🇬🇩', 'Grenada'],
									['+1758','🇱🇨', 'Saint Lucia'],
									['+1784','🇻🇨', 'St. Vincent & Grenadines'],
									['+1767','🇩🇲', 'Dominica'],
									['+1869','🇰🇳', 'Saint Kitts & Nevis'],
									['+1264','🇦🇮', 'Anguilla'],
									['+1268','🇦🇬', 'Antigua & Barbuda'],
									['+1284','🇻🇬', 'British Virgin Islands'],
									['+1340','🇻🇮', 'US Virgin Islands'],
									['+1649','🇹🇨', 'Turks & Caicos'],
									['+1345','🇰🇾', 'Cayman Islands'],
									['+1242','🇧🇸', 'Bahamas'],
									['+53',  '🇨🇺', 'Cuba'],
									['+509', '🇭🇹', 'Haiti'],
									['+590', '🇬🇵', 'Guadeloupe'],
									['+596', '🇲🇶', 'Martinique'],
									['+590', '🇧🇱', 'Saint Barthélemy'],
									['+590', '🇲🇫', 'Saint Martin'],
									['+1664','🇲🇸', 'Montserrat'],
									// — Netherlands —
									['+31',  '🇳🇱', 'Netherlands'],
									// — Americas —
									['+1',   '🇺🇸', 'United States'],
									['+1',   '🇨🇦', 'Canada'],
									['+52',  '🇲🇽', 'Mexico'],
									['+55',  '🇧🇷', 'Brazil'],
									['+54',  '🇦🇷', 'Argentina'],
									['+57',  '🇨🇴', 'Colombia'],
									['+56',  '🇨🇱', 'Chile'],
									['+51',  '🇵🇪', 'Peru'],
									['+58',  '🇻🇪', 'Venezuela'],
									['+593', '🇪🇨', 'Ecuador'],
									['+502', '🇬🇹', 'Guatemala'],
									['+506', '🇨🇷', 'Costa Rica'],
									['+507', '🇵🇦', 'Panama'],
									// — Europe —
									['+44',  '🇬🇧', 'United Kingdom'],
									['+49',  '🇩🇪', 'Germany'],
									['+33',  '🇫🇷', 'France'],
									['+34',  '🇪🇸', 'Spain'],
									['+39',  '🇮🇹', 'Italy'],
									['+32',  '🇧🇪', 'Belgium'],
									['+41',  '🇨🇭', 'Switzerland'],
									['+43',  '🇦🇹', 'Austria'],
									['+351', '🇵🇹', 'Portugal'],
									['+46',  '🇸🇪', 'Sweden'],
									['+47',  '🇳🇴', 'Norway'],
									['+45',  '🇩🇰', 'Denmark'],
									['+358', '🇫🇮', 'Finland'],
									['+7',   '🇷🇺', 'Russia'],
									['+380', '🇺🇦', 'Ukraine'],
									['+48',  '🇵🇱', 'Poland'],
									['+30',  '🇬🇷', 'Greece'],
									['+36',  '🇭🇺', 'Hungary'],
									['+420', '🇨🇿', 'Czechia'],
									['+40',  '🇷🇴', 'Romania'],
									// — Middle East / Africa —
									['+971', '🇦🇪', 'UAE'],
									['+966', '🇸🇦', 'Saudi Arabia'],
									['+974', '🇶🇦', 'Qatar'],
									['+965', '🇰🇼', 'Kuwait'],
									['+973', '🇧🇭', 'Bahrain'],
									['+962', '🇯🇴', 'Jordan'],
									['+961', '🇱🇧', 'Lebanon'],
									['+90',  '🇹🇷', 'Turkey'],
									['+972', '🇮🇱', 'Israel'],
									['+20',  '🇪🇬', 'Egypt'],
									['+212', '🇲🇦', 'Morocco'],
									['+27',  '🇿🇦', 'South Africa'],
									['+234', '🇳🇬', 'Nigeria'],
									['+233', '🇬🇭', 'Ghana'],
									['+254', '🇰🇪', 'Kenya'],
									['+255', '🇹🇿', 'Tanzania'],
									// — Asia / Pacific —
									['+91',  '🇮🇳', 'India'],
									['+92',  '🇵🇰', 'Pakistan'],
									['+880', '🇧🇩', 'Bangladesh'],
									['+86',  '🇨🇳', 'China'],
									['+81',  '🇯🇵', 'Japan'],
									['+82',  '🇰🇷', 'South Korea'],
									['+65',  '🇸🇬', 'Singapore'],
									['+60',  '🇲🇾', 'Malaysia'],
									['+66',  '🇹🇭', 'Thailand'],
									['+84',  '🇻🇳', 'Vietnam'],
									['+63',  '🇵🇭', 'Philippines'],
									['+62',  '🇮🇩', 'Indonesia'],
									['+61',  '🇦🇺', 'Australia'],
									['+64',  '🇳🇿', 'New Zealand'],
								];
								foreach ( $dial_codes as $c ) :
								?>
								<li
									role="option"
									class="sp-dial-option"
									data-code="<?php echo esc_attr( $c[0] ); ?>"
									data-flag="<?php echo esc_attr( $c[1] ); ?>"
									data-name="<?php echo esc_attr( $c[2] ); ?>"
									tabindex="-1"
								>
									<span class="sp-dial-option__flag"><?php echo $c[1]; ?></span>
									<span class="sp-dial-option__name"><?php echo esc_html( $c[2] ); ?></span>
									<span class="sp-dial-option__code"><?php echo esc_html( $c[0] ); ?></span>
								</li>
								<?php endforeach; ?>
							</ul>
						</div><!-- .sp-dial-dropdown -->

					</div><!-- .sp-phone-box -->
				</div><!-- .sp-modal__field -->

				<div class="sp-modal__feedback" id="sp-modal-feedback" aria-live="polite" hidden></div>

				<button type="submit" class="sp-modal__submit" id="sp-modal-submit">
					<span id="sp-modal-btn-label"><?php echo $modal_btn; ?></span>
				</button>
			</form>

			<p class="sp-modal__terms">
				By clicking "<?php echo $modal_btn; ?>" you agree to receive messages about upcoming events.
			</p>
		</div>
	</div>

	<!-- =================================================================
	     TABS
	     ================================================================= -->
	<?php if ( ! empty( $tabs ) ) : ?>
		<section class="sp-tabs-section">

			<div class="sp-tabs-nav-wrap">
				<nav class="sp-tabs-nav" role="tablist" aria-label="Profile sections" id="sp-tabs-nav">
					<?php foreach ( $tabs as $i => $tab ) : ?>
						<button
							class="sp-tab-btn<?php echo $i === 0 ? ' is-active' : ''; ?>"
							role="tab"
							aria-selected="<?php echo $i === 0 ? 'true' : 'false'; ?>"
							aria-controls="sp-tab-panel-<?php echo esc_attr( $tab['slug'] ); ?>"
							data-tab="<?php echo esc_attr( $tab['slug'] ); ?>"
							id="sp-tab-<?php echo esc_attr( $tab['slug'] ); ?>"
						><?php echo esc_html( $tab['name'] ); ?></button>
					<?php endforeach; ?>
				</nav>
			</div>

			<div class="sp-tabs-content" id="sp-tabs-content">
				<?php
				// Helper: extract YouTube video ID from any YouTube URL
				function sp_youtube_id( string $url ): string {
					if ( preg_match( '/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/', $url, $m ) ) {
						return $m[1];
					}
					return '';
				}
				?>
				<?php foreach ( $tabs as $i => $tab ) : ?>
					<div
						class="sp-tab-panel<?php echo $i === 0 ? ' is-active' : ''; ?>"
						role="tabpanel"
						aria-labelledby="sp-tab-<?php echo esc_attr( $tab['slug'] ); ?>"
						id="sp-tab-panel-<?php echo esc_attr( $tab['slug'] ); ?>"
						data-tab-slug="<?php echo esc_attr( $tab['slug'] ); ?>"
					>
						<?php if ( empty( $tab['items'] ) ) : ?>
							<p class="sp-empty">No items yet.</p>

						<?php elseif ( ( $tab['card_type'] ?? 'media' ) === 'event' ) : ?>

							<?php
							// Sort: upcoming first (closest date), past at bottom
							$today    = strtotime( 'today' );
							$upcoming = [];
							$past     = [];
							foreach ( $tab['items'] as $item ) {
								$ts = ! empty( $item['date'] ) ? strtotime( $item['date'] ) : 0;
								if ( $ts && $ts < $today ) {
									$past[] = $item;
								} else {
									$upcoming[] = $item;
								}
							}
							// Sort upcoming: nearest first
							usort( $upcoming, function( $a, $b ) {
								return strtotime( $a['date'] ?: '9999-01-01' ) - strtotime( $b['date'] ?: '9999-01-01' );
							} );
							// Sort past: most recent first
							usort( $past, function( $a, $b ) {
								return strtotime( $b['date'] ?: '0' ) - strtotime( $a['date'] ?: '0' );
							} );
							$all_events = array_merge( $upcoming, $past );
							?>

							<div class="sp-cards" data-sp-limit="5">
								<?php foreach ( $all_events as $item ) :
									$ts       = ! empty( $item['date'] ) ? strtotime( $item['date'] ) : 0;
									$is_past  = $ts && $ts < $today;
								?>
									<article class="sp-card sp-card--event<?php echo $is_past ? ' sp-card--past' : ''; ?>">
										<div class="sp-card__thumb">
											<?php if ( ! empty( $item['image'] ) ) : ?>
												<img src="<?php echo esc_url( $item['image'] ); ?>" alt="<?php echo esc_attr( $item['title'] ); ?>" loading="lazy">
											<?php else : ?>
												<div class="sp-card__thumb-icon">
													<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="26" height="26"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
												</div>
											<?php endif; ?>
										</div>
										<div class="sp-card__body">
											<div class="sp-card__labels">
												<?php if ( ! empty( $item['city'] ) ) : ?>
													<span class="sp-card__label"><?php echo esc_html( $item['city'] ); ?></span>
												<?php endif; ?>
												<?php if ( $is_past ) : ?>
													<span class="sp-card__past-badge">Past Event</span>
												<?php endif; ?>
											</div>
											<h3 class="sp-card__title"><?php echo esc_html( $item['title'] ); ?></h3>
											<p class="sp-card__meta">
												<?php if ( $ts ) echo esc_html( date_i18n( 'M j, Y', $ts ) ); ?>
												<?php if ( $ts && ! empty( $item['venue'] ) ) echo ' &bull; '; ?>
												<?php if ( ! empty( $item['venue'] ) ) echo esc_html( $item['venue'] ); ?>
											</p>
										</div>
										<?php
										$to = $item['ticket_options'] ?? [];
										$has_loc   = ! empty( $to['location']['enabled'] ) && ! empty( $to['location']['items'] );
										$has_payaw = ! empty( $to['payaw']['enabled'] );
										$has_rsvp  = ! empty( $to['rsvp']['enabled'] )     && ! empty( $to['rsvp']['whatsapp'] );
										$has_vip   = ! empty( $to['vip']['enabled'] )      && ! empty( $to['vip']['phone'] );
										$has_link  = ! empty( $to['link']['enabled'] )     && ! empty( $to['link']['url'] );
										$has_tickets = $has_loc || $has_payaw || $has_rsvp || $has_vip || $has_link;
										?>
										<?php if ( ! $is_past && $has_tickets ) :
											$ticket_data = [
												'title'    => $item['title'],
												'btn_text' => $item['btn_text'] ?: 'Get Tickets',
												'options'  => [],
											];
											if ( $has_loc ) {
												foreach ( $to['location']['items'] as $loc_item ) {
													$ticket_data['options'][] = [ 'type' => 'location', 'place_name' => $loc_item['place_name'] ?? '', 'address' => $loc_item['address'] ?? '', 'maps_url' => $loc_item['maps_url'] ?? '' ];
												}
											}
											if ( $has_payaw ) $ticket_data['options'][] = [ 'type' => 'payaw' ];
											if ( $has_rsvp )  $ticket_data['options'][] = [ 'type' => 'rsvp', 'whatsapp' => preg_replace( '/[^0-9+]/', '', $to['rsvp']['whatsapp'] ) ];
											if ( $has_vip )   $ticket_data['options'][] = [ 'type' => 'vip',  'phone' => preg_replace( '/[^0-9+\-\s\(\)]/', '', $to['vip']['phone'] ) ];
											if ( $has_link )  $ticket_data['options'][] = [ 'type' => 'link', 'url' => $to['link']['url'], 'label' => $to['link']['label'] ?: 'Buy Tickets', 'icon_url' => $to['link']['icon_url'] ?? '' ];
										?>
											<div class="sp-card__action">
												<button type="button" class="sp-card__btn sp-tickets-open"
													data-tickets="<?php echo esc_attr( wp_json_encode( $ticket_data ) ); ?>">
													<?php echo esc_html( $item['btn_text'] ?: 'Get Tickets' ); ?>
												</button>
											</div>
										<?php elseif ( ! $is_past && ! empty( $item['btn_url'] ) && ! empty( $item['btn_text'] ) ) : ?>
											<div class="sp-card__action">
												<a href="<?php echo esc_url( $item['btn_url'] ); ?>" class="sp-card__btn" target="_blank" rel="noopener noreferrer">
													<?php echo esc_html( $item['btn_text'] ); ?>
												</a>
											</div>
										<?php endif; ?>
									</article>
								<?php endforeach; ?>
							</div>

						<?php else : ?>

							<?php
							// Mixes / Media tab — YouTube-first rendering
							$items = array_values( $tab['items'] );
							?>

							<?php if ( ! empty( $items[0] ) ) :
								$featured      = $items[0];
								$featured_type = $featured['media_type'] ?? 'youtube';
								$featured_id   = $featured_type === 'youtube' ? sp_youtube_id( $featured['youtube_url'] ?? '' ) : '';
							?>
								<!-- Featured item -->
								<div class="sp-yt-featured">
									<?php if ( $featured_type === 'youtube' && $featured_id ) : ?>
										<div class="sp-yt-embed">
											<iframe
												src="https://www.youtube.com/embed/<?php echo esc_attr( $featured_id ); ?>?rel=0"
												title="<?php echo esc_attr( $featured['title'] ); ?>"
												frameborder="0"
												allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
												allowfullscreen
												loading="lazy"
											></iframe>
										</div>
									<?php elseif ( $featured_type === 'custom' && ! empty( $featured['image'] ) ) : ?>
										<img src="<?php echo esc_url( $featured['image'] ); ?>" alt="<?php echo esc_attr( $featured['title'] ); ?>" class="sp-yt-featured__img">
									<?php endif; ?>
									<h3 class="sp-yt-featured__title"><?php echo esc_html( $featured['title'] ); ?></h3>
									<?php if ( ! empty( $featured['subtitle'] ) ) : ?>
										<p class="sp-yt-featured__sub"><?php echo esc_html( $featured['subtitle'] ); ?></p>
									<?php endif; ?>
									<?php if ( $featured_type === 'custom' && ! empty( $featured['btn_url'] ) && ! empty( $featured['btn_text'] ) ) : ?>
										<a href="<?php echo esc_url( $featured['btn_url'] ); ?>" class="sp-card__btn" target="_blank" rel="noopener noreferrer">
											<?php echo esc_html( $featured['btn_text'] ); ?>
										</a>
									<?php endif; ?>
								</div>
							<?php endif; ?>

							<?php if ( count( $items ) > 1 ) : ?>
								<!-- Rest: thumbnail list cards -->
								<div class="sp-yt-list" data-sp-limit="4">
									<?php foreach ( array_slice( $items, 1 ) as $item ) :
										$item_type = $item['media_type'] ?? 'youtube';
										$vid_id    = $item_type === 'youtube' ? sp_youtube_id( $item['youtube_url'] ?? '' ) : '';
										if ( $item_type === 'youtube' ) {
											$thumb = $vid_id ? 'https://img.youtube.com/vi/' . $vid_id . '/mqdefault.jpg' : '';
											$link  = $item['youtube_url'] ?? '#';
										} elseif ( $item_type === 'soundcloud' ) {
											$thumb = $item['soundcloud_thumb'] ?? '';
											$link  = $item['soundcloud_url'] ?? '#';
										} else {
											$thumb = $item['image'] ?? '';
											$link  = $item['btn_url'] ?? '#';
										}
									?>
										<a href="<?php echo esc_url( $link ); ?>" class="sp-yt-card" target="_blank" rel="noopener noreferrer">
											<div class="sp-yt-card__thumb">
												<?php if ( $thumb ) : ?>
													<img src="<?php echo esc_url( $thumb ); ?>" alt="<?php echo esc_attr( $item['title'] ); ?>" loading="lazy">
												<?php endif; ?>
												<span class="sp-yt-card__play">
													<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M8 5v14l11-7z"/></svg>
												</span>
											</div>
											<div class="sp-yt-card__body">
												<h4 class="sp-yt-card__title"><?php echo esc_html( $item['title'] ); ?></h4>
												<?php if ( ! empty( $item['subtitle'] ) ) : ?>
													<p class="sp-yt-card__sub"><?php echo esc_html( $item['subtitle'] ); ?></p>
												<?php endif; ?>
												<?php if ( $item_type === 'youtube' ) : ?>
													<span class="sp-yt-card__source">youtube</span>
												<?php elseif ( $item_type === 'soundcloud' ) : ?>
													<span class="sp-yt-card__source">soundcloud</span>
												<?php elseif ( ! empty( $item['btn_text'] ) ) : ?>
													<span class="sp-yt-card__source"><?php echo esc_html( $item['btn_text'] ); ?></span>
												<?php endif; ?>
											</div>
										</a>
									<?php endforeach; ?>
								</div>
							<?php endif; ?>

						<?php endif; ?>
					</div>
				<?php endforeach; ?>
			</div>

		</section>
	<?php endif; ?>

	<!-- =================================================================
	     TICKET OPTIONS MODAL
	     ================================================================= -->
	<div class="sp-modal-overlay" id="sp-ticket-overlay" role="dialog" aria-modal="true" aria-labelledby="sp-ticket-title" hidden>
		<div class="sp-modal" id="sp-ticket-modal">
			<button class="sp-modal__close" id="sp-ticket-close" aria-label="Close">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
			</button>
			<h2 class="sp-modal__title" id="sp-ticket-title">Get Tickets</h2>
			<div class="sp-ticket-opts" id="sp-ticket-opts"></div>
		</div>
	</div>

</div><!-- .sp-page -->

<?php get_footer(); ?>
