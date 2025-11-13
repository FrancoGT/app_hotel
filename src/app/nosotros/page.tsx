"use client"

export default function NosotrosPage() {
  return (
    <div className="max-w-[1024px] mx-auto mt-8 mb-12">
      <div className="card">
        <h2 className="text-3xl font-serif text-center mb-6" style={{ color: "#9F836A" }}>
          Nosotros
        </h2>
        <div className="space-y-4">
          <p className="text-base" style={{ color: "var(--illary-text-light)" }}>
            En <strong>Hotel Hillary</strong>, creemos que cada estadía debe ser una experiencia única, confortable y
            memorable. Ubicados en el corazón de Arequipa, ofrecemos a nuestros huéspedes un ambiente acogedor, con un
            servicio personalizado que refleja lo mejor de la hospitalidad peruana.
          </p>
          <p className="text-base" style={{ color: "var(--illary-text-light)" }}>
            Nuestra misión es brindar una experiencia de alojamiento excepcional, combinando comodidad, modernidad y un
            trato cálido que haga sentir a cada visitante como en casa. Ya sea que nos visites por negocios, turismo o
            descanso, en Hotel Hillary encontrarás el equilibrio perfecto entre tranquilidad, conveniencia y atención de
            calidad.
          </p>
          <p className="text-base" style={{ color: "var(--illary-text-light)" }}>
            Contamos con habitaciones modernas, servicios adaptados a tus necesidades y un equipo comprometido con
            superar tus expectativas. Además, nuestra ubicación estratégica te conecta con los principales atractivos
            turísticos, centros comerciales y zonas empresariales de la ciudad.
          </p>
        </div>
      </div>
    </div>
  )
}