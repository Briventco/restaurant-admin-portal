import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Nav from './Nav';
import Footer from './Footer';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Privacy Policy — Servra';
  }, []);

  return (
    <div className="lp-app privacy-policy">
      <Nav />

      <main className="privacy-policy__main">
        <div className="privacy-policy__wrap">
          <button onClick={() => navigate('/')} className="lp-btn lp-btn--outline privacy-policy__back">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
          </button>

          <p className="lp-tag">Legal</p>
          <h1 className="lp-heading privacy-policy__title">Privacy Policy</h1>
          <p className="privacy-policy__updated">Last updated: June 2026</p>

          <p>
            This Privacy Policy explains how Servra, a product operated by{' '}
            <strong>Brivent Global Innovations Limited</strong> (&quot;Brivent,&quot;
            &quot;Servra,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;),
            collects, uses, stores, and protects information when businesses
            (&quot;Vendors&quot;) and their customers (&quot;Customers&quot;) use our
            WhatsApp-based order automation service (the &quot;Service&quot;).
          </p>

          <p>
            By using Servra, you agree to the practices described in this Privacy Policy.
            If you do not agree, please do not use the Service.
          </p>

          <hr className="privacy-policy__divider" />

          <h2>1. Who We Are</h2>
          <p>
            Servra is an AI-powered order management service that connects to a
            Vendor&apos;s WhatsApp Business number to automatically receive, process,
            and confirm customer orders. Servra is owned and operated by Brivent Global
            Innovation Limited, a company registered in Nigeria.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We collect the following categories of information:</p>
          <ul>
            <li>
              <strong>Vendor Information:</strong> business name, WhatsApp Business phone
              number, menu and pricing details, delivery coverage areas, email address,
              and account credentials.
            </li>
            <li>
              <strong>Customer Information:</strong> WhatsApp display name, phone number,
              order details (items, quantities, delivery or pickup preference), and
              delivery address, where provided directly within the ordering conversation.
            </li>
            <li>
              <strong>Message Content:</strong> the content of WhatsApp messages exchanged
              between Customers and Vendors through the Servra platform, including text
              messages and voice notes, which is processed to extract order information.
            </li>
            <li>
              <strong>Usage Data:</strong> information about how Vendors interact with the
              Servra dashboard, including login activity and settings changes.
            </li>
          </ul>

          <h2>3. How We Use Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Operate the core Service, including receiving, interpreting, and processing orders sent via WhatsApp</li>
            <li>Generate accurate order summaries, calculate totals, and apply delivery pricing</li>
            <li>Send order confirmations and status alerts to Vendors and Customers</li>
            <li>Maintain and improve the reliability and accuracy of our AI order-processing system</li>
            <li>Provide customer support to Vendors</li>
            <li>Comply with legal obligations and protect against fraud or misuse of the Service</li>
          </ul>
          <p>
            We do <strong>not</strong> sell Vendor or Customer information to third
            parties, and we do not use Customer message content for advertising purposes.
          </p>

          <h2>4. How Messages Are Processed</h2>
          <p>
            When a Customer sends a message to a Vendor&apos;s WhatsApp number connected
            to Servra, the message content is processed by our system to identify order
            details such as items, quantities, and delivery preferences. This processing
            may involve secure, encrypted requests to third-party artificial intelligence
            providers (such as OpenAI or Anthropic) solely for the purpose of extracting
            structured order information. These providers do not retain message content
            for their own purposes beyond what is necessary to fulfill the request, and
            are contractually and technically restricted from using this data to train
            their models on our behalf.
          </p>
          <p>
            Servra&apos;s system is designed so that message interpretation is limited
            strictly to order-related information extraction. Our AI does not make final
            business decisions on behalf of Vendors; all order confirmations require
            explicit Vendor approval.
          </p>

          <h2>5. Data Sharing</h2>
          <p>We may share information with:</p>
          <ul>
            <li>
              <strong>WhatsApp / Meta Platforms, Inc.</strong> as the messaging
              infrastructure provider, in accordance with WhatsApp Business Platform policies
            </li>
            <li>
              <strong>Third-party AI service providers</strong> strictly for order
              extraction as described above
            </li>
            <li>
              <strong>Payment processors</strong> (where applicable) solely to facilitate
              order payment
            </li>
            <li>
              <strong>Logistics or delivery partners</strong> (where applicable and only
              with Vendor configuration) to facilitate order delivery
            </li>
            <li>
              <strong>Legal or regulatory authorities</strong> where required by law
            </li>
          </ul>
          <p>
            We do not share Vendor or Customer data with unrelated third parties for
            marketing purposes.
          </p>

          <h2>6. Data Retention</h2>
          <p>
            We retain order and message data for as long as necessary to provide the
            Service, maintain accurate order history for Vendors, and comply with
            applicable legal or accounting obligations. Vendors may request deletion of
            their account and associated data at any time by contacting us using the
            details below.
          </p>

          <h2>7. Data Security</h2>
          <p>
            We implement reasonable technical and organizational measures to protect Vendor
            and Customer information from unauthorized access, alteration, disclosure, or
            destruction. Access to sensitive information, such as payment settings, is
            restricted based on user role — for example, Vendor staff accounts do not have
            access to payment configuration, which is reserved for Vendor administrators
            only.
          </p>

          <h2>8. Your Rights</h2>
          <p>
            Depending on your location, you may have rights to access, correct, or request
            deletion of your personal information. Vendors and Customers may contact us at
            the email address below to exercise these rights. We will respond to verified
            requests within a reasonable timeframe.
          </p>

          <h2>9. Children&apos;s Privacy</h2>
          <p>
            Servra is intended for use by businesses and their adult customers. We do not
            knowingly collect information from children under the age of 13.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our
            practices or for legal, operational, or regulatory reasons. Material changes
            will be reflected by updating the &quot;Last updated&quot; date at the top of
            this page.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy or how your
            information is handled, please contact us:
          </p>

          <div className="privacy-policy__contact-box">
            <p><strong>Brivent Global Innovations Limited</strong></p>
            <p>Product: Servra</p>
            <p>Email: <a href="mailto:hello@servra.io">hello@servra.io</a></p>
            <p>Website: <a href="https://servra.io">servra.io</a></p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
