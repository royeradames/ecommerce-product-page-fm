"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CartIcon, CloseIcon, DeleteIcon, MenuIcon, MinusIcon, NextIcon, PlusIcon, PreviousIcon } from "./icons";
import { formatPrice, product } from "./site";

const navLinks = ["Collections", "Men", "Women", "About", "Contact"] as const;
const MAX_QUANTITY = 10;
const MAX_CART = 99;
const imageCount = product.images.length;

const wrap = (index: number) => (index + imageCount) % imageCount;
const pairs = (n: number) => `${n} ${n === 1 ? "pair" : "pairs"}`;

/** True from 768 px, where the design shows thumbnails and a clickable stage that opens the lightbox. */
function useWideLayout() {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return wide;
}

function Thumbnails({ active, onSelect, label }: { active: number; onSelect: (index: number) => void; label: string }) {
  return (
    <ul className="thumbs" aria-label={label}>
      {product.images.map((image, index) => (
        <li key={image.thumb}>
          <button type="button" className="thumb" aria-pressed={index === active} onClick={() => onSelect(index)}>
            <Image src={image.thumb} alt="" width={88} height={88} />
            <span className="sr-only">
              Show image {index + 1} of {imageCount}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function ProductPage() {
  const wide = useWideLayout();
  const [active, setActive] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [cartNote, setCartNote] = useState("");

  const menuRef = useRef<HTMLDialogElement>(null);
  const lightboxRef = useRef<HTMLDialogElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const cartPanelRef = useRef<HTMLDivElement>(null);
  const cartHeadingRef = useRef<HTMLHeadingElement>(null);

  const closeCart = useCallback((returnFocus: boolean) => {
    setCartOpen(false);
    if (returnFocus) cartButtonRef.current?.focus();
  }, []);

  // The cart is a disclosure: Escape or a press outside it closes it.
  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart(cartPanelRef.current?.contains(document.activeElement) ?? false);
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!cartPanelRef.current?.contains(target) && !cartButtonRef.current?.contains(target)) closeCart(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [cartOpen, closeCart]);

  const openLightbox = () => {
    setLightboxIndex(active);
    lightboxRef.current?.showModal();
  };

  const changeQuantity = (step: number) => {
    const next = quantity + step;
    if (next < 0) return setMessage("The quantity is already 0.");
    if (next > MAX_QUANTITY) return setMessage(`You can add up to ${MAX_QUANTITY} pairs at a time.`);
    setMessage("");
    setQuantity(next);
  };

  const addToCart = () => {
    if (quantity === 0) return setMessage("Choose how many pairs first, with the plus button.");
    const room = MAX_CART - cartCount;
    if (room <= 0) return setMessage(`Your cart already holds the most it can: ${MAX_CART} pairs.`);
    const added = Math.min(quantity, room);
    setCartCount(cartCount + added);
    setQuantity(0);
    setCartNote("");
    setMessage(added < quantity ? `Added ${pairs(added)}. The cart holds up to ${MAX_CART}.` : `Added ${pairs(added)} to your cart.`);
  };

  const removeFromCart = () => {
    setCartCount(0);
    setCartNote("");
    setMessage("Removed the sneakers from your cart.");
    // The delete button disappears with the item; keep focus inside the cart.
    requestAnimationFrame(() => cartHeadingRef.current?.focus());
  };

  const image = product.images[active];
  const lightboxImage = product.images[lightboxIndex];

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <button type="button" className="icon-button menu-button" aria-haspopup="dialog" onClick={() => menuRef.current?.showModal()}>
            <MenuIcon />
            <span className="sr-only">Menu</span>
          </button>
          <Link className="logo" href="/">
            sneakers
          </Link>
          <nav className="desktop-nav" aria-label="Main">
            <ul>
              {navLinks.map((link) => (
                <li key={link}>
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="header-actions">
            <button
              ref={cartButtonRef}
              type="button"
              className="icon-button cart-button"
              aria-expanded={cartOpen}
              aria-controls="cart-panel"
              onClick={() => setCartOpen((open) => !open)}
            >
              <CartIcon />
              <span className="sr-only">Cart{cartCount > 0 ? `, ${pairs(cartCount)}` : ", empty"}</span>
              {cartCount > 0 && (
                <span className="cart-badge" aria-hidden="true">
                  {cartCount}
                </span>
              )}
            </button>
            <Image className="avatar" src="/images/image-avatar.png" alt="Your profile picture" width={100} height={100} priority />
          </div>

          <div ref={cartPanelRef} id="cart-panel" className="cart-panel" hidden={!cartOpen}>
            <h2 ref={cartHeadingRef} tabIndex={-1}>
              Cart
            </h2>
            <div className="cart-body">
              {cartCount === 0 ? (
                <p className="cart-empty">Your cart is empty.</p>
              ) : (
                <>
                  <ul className="cart-items">
                    <li className="cart-item">
                      <Image src={product.images[0].thumb} alt="" width={50} height={50} />
                      <div>
                        <p>{product.name}</p>
                        <p>
                          {formatPrice(product.priceCents)} x {cartCount} <strong>{formatPrice(product.priceCents * cartCount)}</strong>
                        </p>
                      </div>
                      <button type="button" className="icon-button delete-button" onClick={removeFromCart}>
                        <DeleteIcon />
                        <span className="sr-only">Remove {product.name} from the cart</span>
                      </button>
                    </li>
                  </ul>
                  <button type="button" className="primary-button" onClick={() => setCartNote(cartNote ? "" : "Practice demo: checkout isn’t part of this challenge, so nothing is ordered or charged.")}>
                    Checkout
                  </button>
                  <p className="cart-note" role="status">
                    {cartNote}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <dialog
        ref={menuRef}
        className="menu-drawer"
        aria-label="Menu"
        onClick={(event) => {
          if (event.target === event.currentTarget) menuRef.current?.close();
        }}
      >
        <button type="button" className="icon-button close-menu" onClick={() => menuRef.current?.close()}>
          <CloseIcon />
          <span className="sr-only">Close menu</span>
        </button>
        <nav aria-label="Menu">
          <ul>
            {navLinks.map((link) => (
              <li key={link}>
                <a href="#" onClick={() => menuRef.current?.close()}>
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </dialog>

      <main className="product">
        <section className="gallery" aria-label="Product images">
          <div className="stage">
            {wide ? (
              <button type="button" className="stage-button" aria-haspopup="dialog" onClick={openLightbox}>
                <Image src={image.full} alt={image.alt} width={1000} height={1000} priority sizes="(min-width: 768px) 445px, 100vw" />
                <span className="sr-only">Open the gallery</span>
              </button>
            ) : (
              <Image src={image.full} alt={image.alt} width={1000} height={1000} priority sizes="100vw" />
            )}
            <button type="button" className="arrow arrow-previous" onClick={() => setActive(wrap(active - 1))}>
              <PreviousIcon />
              <span className="sr-only">Previous image</span>
            </button>
            <button type="button" className="arrow arrow-next" onClick={() => setActive(wrap(active + 1))}>
              <NextIcon />
              <span className="sr-only">Next image</span>
            </button>
          </div>
          <Thumbnails active={active} onSelect={setActive} label="Product image thumbnails" />
        </section>

        <section className="details" aria-labelledby="product-name">
          <p className="company">{product.company}</p>
          <h1 id="product-name">{product.name}</h1>
          <p className="description">{product.description}</p>
          <div className="price-row">
            <p className="price-now">{formatPrice(product.priceCents)}</p>
            <p className="discount" aria-hidden="true">
              {product.discount}
            </p>
            <p className="price-was" aria-hidden="true">
              <s>{formatPrice(product.originalPriceCents)}</s>
            </p>
            <p className="sr-only">
              {product.discount} off, was {formatPrice(product.originalPriceCents)}
            </p>
          </div>
          <div className="purchase">
            <div className="quantity" role="group" aria-label="Quantity">
              <button type="button" className="quantity-button" onClick={() => changeQuantity(-1)}>
                <MinusIcon />
                <span className="sr-only">Decrease quantity</span>
              </button>
              <span className="quantity-value" aria-live="polite" aria-atomic="true">
                {quantity}
              </span>
              <button type="button" className="quantity-button" onClick={() => changeQuantity(1)}>
                <PlusIcon />
                <span className="sr-only">Increase quantity</span>
              </button>
            </div>
            <button type="button" className="primary-button add-button" onClick={addToCart}>
              <CartIcon />
              Add to cart
            </button>
          </div>
          <p className="form-message" role="status">
            {message}
          </p>
        </section>
      </main>

      <dialog
        ref={lightboxRef}
        className="lightbox"
        aria-label="Product image gallery"
        onClick={(event) => {
          if (event.target === event.currentTarget) lightboxRef.current?.close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") setLightboxIndex(wrap(lightboxIndex - 1));
          if (event.key === "ArrowRight") setLightboxIndex(wrap(lightboxIndex + 1));
        }}
      >
        <div className="lightbox-inner">
          <button type="button" className="icon-button close-lightbox" onClick={() => lightboxRef.current?.close()}>
            <CloseIcon />
            <span className="sr-only">Close gallery</span>
          </button>
          <div className="stage">
            <Image src={lightboxImage.full} alt={lightboxImage.alt} width={1000} height={1000} sizes="550px" />
            <button type="button" className="arrow arrow-previous" onClick={() => setLightboxIndex(wrap(lightboxIndex - 1))}>
              <PreviousIcon />
              <span className="sr-only">Previous image</span>
            </button>
            <button type="button" className="arrow arrow-next" onClick={() => setLightboxIndex(wrap(lightboxIndex + 1))}>
              <NextIcon />
              <span className="sr-only">Next image</span>
            </button>
          </div>
          <Thumbnails active={lightboxIndex} onSelect={setLightboxIndex} label="Gallery thumbnails" />
        </div>
      </dialog>
    </>
  );
}
